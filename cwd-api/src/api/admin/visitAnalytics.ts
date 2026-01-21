import type { Context } from 'hono';
import type { Bindings } from '../../bindings';

type VisitOverview = {
	totalPv: number;
	totalPages: number;
};

type VisitPageItem = {
	postSlug: string;
	postTitle: string | null;
	postUrl: string | null;
	pv: number;
	lastVisitAt: string | null;
};

export const getVisitOverview = async (
	c: Context<{ Bindings: Bindings }>
) => {
	try {
		await c.env.CWD_DB.prepare(
			'CREATE TABLE IF NOT EXISTS page_stats (id INTEGER PRIMARY KEY AUTOINCREMENT, post_slug TEXT UNIQUE NOT NULL, post_title TEXT, post_url TEXT, pv INTEGER NOT NULL DEFAULT 0, last_visit_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)'
		).run();

		const row = await c.env.CWD_DB.prepare(
			'SELECT COUNT(*) as totalPages, COALESCE(SUM(pv), 0) as totalPv FROM page_stats'
		).first<{
			totalPages: number | null;
			totalPv: number | null;
		}>();

		const data: VisitOverview = {
			totalPv: row?.totalPv || 0,
			totalPages: row?.totalPages || 0
		};

		return c.json(data);
	} catch (e: any) {
		return c.json(
			{ message: e.message || '获取访问统计概览失败' },
			500
		);
	}
};

export const getVisitPages = async (c: Context<{ Bindings: Bindings }>) => {
	try {
		await c.env.CWD_DB.prepare(
			'CREATE TABLE IF NOT EXISTS page_stats (id INTEGER PRIMARY KEY AUTOINCREMENT, post_slug TEXT UNIQUE NOT NULL, post_title TEXT, post_url TEXT, pv INTEGER NOT NULL DEFAULT 0, last_visit_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)'
		).run();

		const { results } = await c.env.CWD_DB.prepare(
			'SELECT post_slug, post_title, post_url, pv, last_visit_at FROM page_stats ORDER BY pv DESC, last_visit_at DESC'
		).all<{
			post_slug: string;
			post_title: string | null;
			post_url: string | null;
			pv: number;
			last_visit_at: string | null;
		}>();

		const items: VisitPageItem[] = results.map((row) => ({
			postSlug: row.post_slug,
			postTitle: row.post_title,
			postUrl: row.post_url,
			pv: row.pv || 0,
			lastVisitAt: row.last_visit_at
		}));

		return c.json({ items });
	} catch (e: any) {
		return c.json(
			{ message: e.message || '获取页面访问统计失败' },
			500
		);
	}
};

