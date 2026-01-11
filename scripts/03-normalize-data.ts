#!/usr/bin/env bun
/**
 * 03-normalize-data.ts
 * Normalizes consolidated data into daily OHLCV format
 * Calculates metrics (peak, low, volume stats)
 */

import { mkdir } from 'node:fs/promises';
import type {
	RawTradeRecord,
	DailyOHLCV,
	PeriodMetrics,
	DataSource
} from './lib/data-types';

const CACHE_DIR = '.cache';
const CONSOLIDATED_DIR = `${CACHE_DIR}/consolidated`;
const NORMALIZED_DIR = `${CACHE_DIR}/normalized`;

interface ConsolidatedData {
	cik: string;
	ticker: string;
	company: string;
	records: RawTradeRecord[];
	sources: DataSource[];
	dateRange: {
		start: string;
		end: string;
	};
}

interface NormalizedEntityData {
	cik: string;
	ticker: string;
	company: string;
	period: {
		start: string;
		end: string;
	};
	metrics: PeriodMetrics;
	dailyData: DailyOHLCV[];
	sources: DataSource[];
	normalizedAt: string;
}

async function ensureDirectories(): Promise<void> {
	await mkdir(NORMALIZED_DIR, { recursive: true });
}

function aggregateToDaily(records: RawTradeRecord[]): DailyOHLCV[] {
	// Group by date
	const byDate = new Map<string, RawTradeRecord[]>();

	for (const record of records) {
		const date = record.datetime.split(' ')[0];
		if (!byDate.has(date)) {
			byDate.set(date, []);
		}
		byDate.get(date)!.push(record);
	}

	// Convert to OHLCV
	const daily: DailyOHLCV[] = [];

	for (const [date, dayRecords] of byDate.entries()) {
		// Sort by time within the day
		dayRecords.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

		const prices = dayRecords.map((r) => r.price).filter((p) => p > 0);
		const volumes = dayRecords.map((r) => r.volume).filter((v) => v > 0);
		const sources = new Set<DataSource>(dayRecords.map((r) => r.source));

		if (prices.length === 0) continue;

		const open = prices[0];
		const close = prices[prices.length - 1];
		const high = Math.max(...prices);
		const low = Math.min(...prices);
		const volume = volumes.reduce((sum, v) => sum + v, 0);
		const dollarVolume = close * volume;

		daily.push({
			date,
			open,
			high,
			low,
			close,
			volume,
			dollarVolume,
			tradeCount: dayRecords.length,
			sources: [...sources]
		});
	}

	// Sort by date
	daily.sort((a, b) => a.date.localeCompare(b.date));

	return daily;
}

function calculateMetrics(dailyData: DailyOHLCV[]): PeriodMetrics {
	if (dailyData.length === 0) {
		return {
			peakPrice: 0,
			peakDate: '',
			lowPrice: 0,
			lowDate: '',
			avgPrice: 0,
			highestVolumeDay: '',
			highestVolumeAmount: 0,
			highestDollarVolumeDay: '',
			highestDollarVolumeAmount: 0,
			totalVolume: 0,
			totalDollarVolume: 0,
			tradingDays: 0,
			firstTradeDate: '',
			lastTradeDate: '',
			priceChange: 0,
			priceChangePercent: 0
		};
	}

	// Find peak and low
	let peakPrice = 0;
	let peakDate = '';
	let lowPrice = Infinity;
	let lowDate = '';
	let highestVolumeDay = '';
	let highestVolumeAmount = 0;
	let highestDollarVolumeDay = '';
	let highestDollarVolumeAmount = 0;
	let totalVolume = 0;
	let totalDollarVolume = 0;
	let priceSum = 0;

	for (const day of dailyData) {
		// Peak price
		if (day.high > peakPrice) {
			peakPrice = day.high;
			peakDate = day.date;
		}

		// Low price (only consider non-zero)
		if (day.low > 0 && day.low < lowPrice) {
			lowPrice = day.low;
			lowDate = day.date;
		}

		// Highest volume day
		if (day.volume > highestVolumeAmount) {
			highestVolumeAmount = day.volume;
			highestVolumeDay = day.date;
		}

		// Highest dollar volume day
		if (day.dollarVolume > highestDollarVolumeAmount) {
			highestDollarVolumeAmount = day.dollarVolume;
			highestDollarVolumeDay = day.date;
		}

		totalVolume += day.volume;
		totalDollarVolume += day.dollarVolume;
		priceSum += day.close;
	}

	// Handle case where no valid low was found
	if (lowPrice === Infinity) {
		lowPrice = 0;
		lowDate = '';
	}

	const firstDay = dailyData[0];
	const lastDay = dailyData[dailyData.length - 1];
	const priceChange = lastDay.close - firstDay.open;
	const priceChangePercent = firstDay.open > 0 ? (priceChange / firstDay.open) * 100 : 0;

	return {
		peakPrice,
		peakDate,
		lowPrice,
		lowDate,
		avgPrice: priceSum / dailyData.length,
		highestVolumeDay,
		highestVolumeAmount,
		highestDollarVolumeDay,
		highestDollarVolumeAmount,
		totalVolume,
		totalDollarVolume,
		tradingDays: dailyData.length,
		firstTradeDate: firstDay.date,
		lastTradeDate: lastDay.date,
		priceChange,
		priceChangePercent
	};
}

async function normalizeEntity(filePath: string): Promise<NormalizedEntityData | null> {
	const file = Bun.file(filePath);
	if (!(await file.exists())) {
		return null;
	}

	const data = (await file.json()) as ConsolidatedData;
	console.log(`\nNormalizing ${data.ticker} (${data.cik})...`);
	console.log(`  Input records: ${data.records.length}`);

	// Aggregate to daily OHLCV
	const dailyData = aggregateToDaily(data.records);
	console.log(`  Daily bars: ${dailyData.length}`);

	// Calculate metrics
	const metrics = calculateMetrics(dailyData);

	console.log(`  Peak price: $${metrics.peakPrice.toFixed(4)} on ${metrics.peakDate}`);
	console.log(`  Low price: $${metrics.lowPrice.toFixed(4)} on ${metrics.lowDate}`);
	console.log(`  Total volume: ${metrics.totalVolume.toLocaleString()} shares`);
	console.log(`  Total dollar volume: $${metrics.totalDollarVolume.toLocaleString()}`);
	console.log(`  Highest volume day: ${metrics.highestVolumeDay} (${metrics.highestVolumeAmount.toLocaleString()} shares)`);

	return {
		cik: data.cik,
		ticker: data.ticker,
		company: data.company,
		period: data.dateRange,
		metrics,
		dailyData,
		sources: data.sources,
		normalizedAt: new Date().toISOString()
	};
}

async function main(): Promise<void> {
	console.log('========================================');
	console.log('03-normalize-data.ts - Data Normalization');
	console.log('========================================');
	console.log(`Started: ${new Date().toISOString()}`);

	await ensureDirectories();

	// Find all consolidated files using readdir
	const { readdir } = await import('node:fs/promises');
	const files = await readdir(CONSOLIDATED_DIR);
	const jsonFiles = files.filter((f) => f.startsWith('CIK') && f.endsWith('.json'));
	const normalized: NormalizedEntityData[] = [];

	for (const fileName of jsonFiles) {
		const filePath = `${CONSOLIDATED_DIR}/${fileName}`;
		const data = await normalizeEntity(filePath);
		if (data) {
			normalized.push(data);

			// Save normalized file
			const outputPath = `${NORMALIZED_DIR}/${data.cik}-${data.ticker}.json`;
			await Bun.write(outputPath, JSON.stringify(data, null, 2));
			console.log(`  Saved to ${outputPath}`);
		}
	}

	// Save summary
	const summary = {
		entities: normalized.map((n) => ({
			cik: n.cik,
			ticker: n.ticker,
			company: n.company,
			tradingDays: n.metrics.tradingDays,
			peakPrice: n.metrics.peakPrice,
			lowPrice: n.metrics.lowPrice,
			totalVolume: n.metrics.totalVolume,
			period: n.period
		})),
		normalizedAt: new Date().toISOString()
	};

	await Bun.write(`${NORMALIZED_DIR}/summary.json`, JSON.stringify(summary, null, 2));

	console.log('\n========================================');
	console.log('Normalization complete!');
	console.log(`Entities processed: ${normalized.length}`);
	console.log(`Finished: ${new Date().toISOString()}`);
	console.log('========================================\n');
}

main().catch(console.error);
