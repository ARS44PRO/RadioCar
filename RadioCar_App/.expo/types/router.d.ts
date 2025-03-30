/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/admin_panel` | `/admin_panel`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/all_cars` | `/all_cars`; params?: Router.UnknownInputParams; } | { pathname: `/all_before/vhod`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/admin_panel` | `/admin_panel`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}/all_cars` | `/all_cars`; params?: Router.UnknownOutputParams; } | { pathname: `/all_before/vhod`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/admin_panel${`?${string}` | `#${string}` | ''}` | `/admin_panel${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}/all_cars${`?${string}` | `#${string}` | ''}` | `/all_cars${`?${string}` | `#${string}` | ''}` | `/all_before/vhod${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/admin_panel` | `/admin_panel`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}/all_cars` | `/all_cars`; params?: Router.UnknownInputParams; } | { pathname: `/all_before/vhod`; params?: Router.UnknownInputParams; };
    }
  }
}
