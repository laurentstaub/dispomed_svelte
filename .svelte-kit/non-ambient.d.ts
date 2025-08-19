
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/atc-classes" | "/api/config" | "/api/ema-incidents" | "/api/incidents" | "/api/incidents/product" | "/api/incidents/product/[productId]" | "/api/product" | "/api/product/[productName]" | "/api/sales-by-cis" | "/api/search" | "/api/substitutions" | "/api/substitutions/[cis_code]" | "/product" | "/product/[productId]" | "/substitutions" | "/substitutions/[cis_code]";
		RouteParams(): {
			"/api/incidents/product/[productId]": { productId: string };
			"/api/product/[productName]": { productName: string };
			"/api/substitutions/[cis_code]": { cis_code: string };
			"/product/[productId]": { productId: string };
			"/substitutions/[cis_code]": { cis_code: string }
		};
		LayoutParams(): {
			"/": { productId?: string; productName?: string; cis_code?: string };
			"/api": { productId?: string; productName?: string; cis_code?: string };
			"/api/atc-classes": Record<string, never>;
			"/api/config": Record<string, never>;
			"/api/ema-incidents": Record<string, never>;
			"/api/incidents": { productId?: string };
			"/api/incidents/product": { productId?: string };
			"/api/incidents/product/[productId]": { productId: string };
			"/api/product": { productName?: string };
			"/api/product/[productName]": { productName: string };
			"/api/sales-by-cis": Record<string, never>;
			"/api/search": Record<string, never>;
			"/api/substitutions": { cis_code?: string };
			"/api/substitutions/[cis_code]": { cis_code: string };
			"/product": { productId?: string };
			"/product/[productId]": { productId: string };
			"/substitutions": { cis_code?: string };
			"/substitutions/[cis_code]": { cis_code: string }
		};
		Pathname(): "/" | "/api" | "/api/atc-classes" | "/api/config" | "/api/ema-incidents" | "/api/incidents" | "/api/incidents/product" | `/api/incidents/product/${string}` & {} | "/api/product" | `/api/product/${string}` & {} | "/api/sales-by-cis" | "/api/search" | "/api/substitutions" | `/api/substitutions/${string}` & {} | "/product" | `/product/${string}` & {} | "/substitutions" | `/substitutions/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): never;
	}
}