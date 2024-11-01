export type BaseGenome = {
  id: number;
}

export type Population<TGenome extends BaseGenome> = TGenome[];

export type GradeRow = number[];
export type GradeGenerationTask<TTaskConfig> = (data: TTaskConfig) => Promise<GradeRow>;

export type GenerationScores = number[];
export type GenerationCallback = (generation: number, result: GenerationScores) => void;

export type GeneticSearchConfig = {
  populationSize: number;
  survivalRate: number;
  crossoverRate: number;
};

export type MutationStrategyConfig = {
  probability: number;
}

export type RunnerStrategyConfig<TTaskConfig> = {
  poolSize: number;
  task: GradeGenerationTask<TTaskConfig>;
}

export type StrategyConfig<TGenome extends BaseGenome> = {
  populate: PopulateStrategyInterface<TGenome>;
  runner: RunnerStrategyInterface<TGenome>;
  scoring: ScoringStrategyInterface;
  mutation: MutationStrategyInterface<TGenome>;
  crossover: CrossoverStrategyInterface<TGenome>;
}

export type GeneticSearchReferenceConfig = {
  reference: GradeRow;
  weights: GradeRow;
};

export interface PopulateStrategyInterface<TGenome extends BaseGenome> {
  populate(size: number): Population<TGenome>;
}

export interface MutationStrategyInterface<TGenome extends BaseGenome> {
  mutate(id: number, item: TGenome): TGenome;
}

export interface CrossoverStrategyInterface<TGenome extends BaseGenome> {
  cross(id: number, lhs: TGenome, rhs: TGenome): TGenome;
}

export interface RunnerStrategyInterface<TGenome extends BaseGenome> {
  run(population: Population<TGenome>): Promise<GradeRow[]>;
}

export interface ScoringStrategyInterface {
  score(results: GradeRow[]): GenerationScores;
}

export interface GeneticSearchInterface<TGenome extends BaseGenome> {
  run(generationsCount: number, afterStep: GenerationCallback): Promise<void>;
  runGenerationStep(): Promise<GenerationScores>;
  getBestGenome(): TGenome;
  getPopulation(): Population<TGenome>;
  setPopulation(population: Population<TGenome>): void;
}
