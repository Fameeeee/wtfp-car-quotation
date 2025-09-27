import { renderDefault, Helpers } from './default';
import { renderOne } from './templateOne';

export const TEMPLATES: Record<
  string,
  (data: any, opts: any, helpers: Helpers) => Promise<string>
> = {
  default: renderDefault,
  template1: renderOne,
};
