declare module "world-countries" {
  interface WorldCountry {
    cca2: string;
    region: string;
    name: { common: string };
    translations?: {
      fra?: { common?: string; official?: string };
    };
    idd?: {
      root?: string;
      suffixes?: string[];
    };
  }

  const countries: WorldCountry[];
  export default countries;
}
