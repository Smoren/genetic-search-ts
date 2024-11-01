export type BaseGenome = {
  id: number;
}

export type Population<TGenome extends BaseGenome> = TGenome[];

export type GenomeGradeRow = number[];
export type GenerationScoreColumn = number[];

export type GradeGenerationTask<TTaskConfig> = (data: TTaskConfig) => Promise<GenomeGradeRow>;
export type GenerationCallback = (generation: number, result: GenerationScoreColumn) => void;

export type GeneticSearchConfig = {
  populationSize: number;
  survivalRate: number;
  crossoverRate: number;
};

export type MutationStrategyConfig = {
  probability: number;
}

export type RunnerStrategyConfig<TTaskConfig> = {
  poolSize: number; // TODO
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
  reference: GenomeGradeRow;
  weights: GenomeGradeRow;
};

export interface PopulateStrategyInterface<TGenome extends BaseGenome> {
  populate(size: number): Population<TGenome>;
}

export interface MutationStrategyInterface<TGenome extends BaseGenome> {
  mutate(genome: TGenome, newGenomeId: number): TGenome;
}

export interface CrossoverStrategyInterface<TGenome extends BaseGenome> {
  cross(lhs: TGenome, rhs: TGenome, newGenomeId: number): TGenome;
}

export interface RunnerStrategyInterface<TGenome extends BaseGenome> {
  run(population: Population<TGenome>): Promise<GenomeGradeRow[]>;
}

export interface ScoringStrategyInterface {
  score(results: GenomeGradeRow[]): GenerationScoreColumn;
}

export interface GeneticSearchInterface<TGenome extends BaseGenome> {
  run(generationsCount: number, afterStep: GenerationCallback): Promise<void>;
  runGenerationStep(): Promise<GenerationScoreColumn>;
  getBestGenome(): TGenome;
  getPopulation(): Population<TGenome>;
  setPopulation(population: Population<TGenome>): void;
}
