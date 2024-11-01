export type BaseGenome = {
  id: number;
}

export type Population<TGenome extends BaseGenome> = TGenome[];

export type NextIdGetter = () => number;

export type GenomeGradeRow = number[];
export type GenerationScoreColumn = number[];
export type GenerationGradeMatrix = GenomeGradeRow[];

export type GradeGenerationTask<TTaskConfig> = (data: TTaskConfig) => Promise<GenomeGradeRow>;
export type GenerationCallback = (generation: number, result: GenerationScoreColumn) => void;

export type GeneticSearchConfig = {
  populationSize: number;
  survivalRate: number;
  crossoverRate: number;
};

export type GeneticFitConfig = {
  generationsCount: number;
  afterStep?: GenerationCallback;
}

export type ComposedGeneticSearchConfig = {
  eliminators: GeneticSearchConfig;
  final: GeneticSearchConfig;
}

export type BaseMutationStrategyConfig = {
  probability: number;
}

export type RunnerStrategyConfig<TTaskConfig> = {
  task: GradeGenerationTask<TTaskConfig>;
}

export type MultiprocessingRunnerStrategyConfig<TTaskConfig> = RunnerStrategyConfig<TTaskConfig> & {
  poolSize: number;
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
  populate(size: number, nextIdGetter: NextIdGetter): Population<TGenome>;
}

export interface MutationStrategyInterface<TGenome extends BaseGenome> {
  mutate(genome: TGenome, newGenomeId: number): TGenome;
}

export interface CrossoverStrategyInterface<TGenome extends BaseGenome> {
  cross(lhs: TGenome, rhs: TGenome, newGenomeId: number): TGenome;
}

export interface RunnerStrategyInterface<TGenome extends BaseGenome> {
  run(population: Population<TGenome>): Promise<GenerationGradeMatrix>;
}

export interface ScoringStrategyInterface {
  score(results: GenerationGradeMatrix): GenerationScoreColumn;
}

export interface GeneticSearchInterface<TGenome extends BaseGenome> {
  readonly bestGenome: TGenome;
  readonly partitions: [number, number, number];
  population: Population<TGenome>
  fit(config: GeneticFitConfig): Promise<void>;
  step(): Promise<GenerationScoreColumn>;
}
