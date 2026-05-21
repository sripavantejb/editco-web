export type FaqItem = {
  q: string;
  a: string;
};

export type BreadcrumbItem = {
  name: string;
  href: string;
};

export type ArticleInput = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime?: string;
};
