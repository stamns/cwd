import type { Context } from 'hono';
import type { Bindings } from '../../bindings';

type TrackVisitBody = {
	postSlug?: string;
	postTitle?: string;
	postUrl?: string;
};

export const trackVisit = async (c: Context<{ Bindings: Bindings }>) => {
	try {
		const body = (await c.req.json().catch(() => ({}))) as TrackVisitBody;

		const rawPostSlug = typeof body.postSlug === 'string' ? body.postSlug.trim() : '';
		const rawPostTitle = typeof body.postTitle === 'string' ? body.postTitle.trim() : '';
		const rawPostUrl = typeof body.postUrl === 'string' ? body.postUrl.trim() : '';

		if (!rawPostSlug) {
			return c.json({ message: 'postSlug is required' }, 400);
		}

		await c.env.CWD_DB.prepare(
			'CREATE TABLE IF NOT EXISTS page_stats (id INTEGER PRIMARY KEY AUTOINCREMENT, post_slug TEXT UNIQUE NOT NULL, post_title TEXT, post_url TEXT, pv INTEGER NOT NULL DEFAULT 0, last_visit_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)'
		).run();

		const now = new Date().toISOString();

		const existing = await c.env.CWD_DB.prepare(
			'SELECT id, pv FROM page_stats WHERE post_slug = ?'
		)
			.bind(rawPostSlug)
			.first<{ id: number; pv: number }>();

		if (!existing) {
			await c.env.CWD_DB.prepare(
				'INSERT INTO page_stats (post_slug, post_title, post_url, pv, last_visit_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
			)
				.bind(
					rawPostSlug,
					rawPostTitle || null,
					rawPostUrl || null,
					1,
					now,
					now,
					now
				)
				.run();
		} else {
			const newPv = (existing.pv || 0) + 1;
			await c.env.CWD_DB.prepare(
				'UPDATE page_stats SET post_title = ?, post_url = ?, pv = ?, last_visit_at = ?, updated_at = ? WHERE id = ?'
			)
				.bind(
					rawPostTitle || null,
					rawPostUrl || null,
					newPv,
					now,
					now,
					existing.id
				)
				.run();
		}

		return c.json({ success: true });
	} catch (e: any) {
		return c.json({ message: e.message || '记录访问数据失败' }, 500);
	}
};

