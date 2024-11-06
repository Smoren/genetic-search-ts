export type BaseGenome = {
  id: number;
}

export type Population<TGenome extends BaseGenome> = TGenome[];

export type NextIdGetter = () => number;

export type GenomeMetricsRow = number[];
export type GenerationFitnessColumn = number[];
export type GenerationMetricsMatrix = GenomeMetricsRow[];

export type CalcMetricsTask<TTaskConfig> = (data: TTaskConfig) => Promise<GenomeMetricsRow>;
export type GenerationCallback = (generation: number, scores: GenerationFitnessColumn) => void;

export type GeneticSearchConfig = {
  populationSize: number;
  survivalRate: number;
  crossoverRate: number;
};

export type GeneticSearchFitConfig = {
  generationsCount: number;
  afterStep?: GenerationCallback;
  stopCondition?: (scores: GenerationFitnessColumn) => boolean;
}

export type ComposedGeneticSearchConfig = {
  eliminators: GeneticSearchConfig;
  final: GeneticSearchConfig;
}

export type BaseMutationStrategyConfig = {
  probability: number;
}

export type MetricsStrategyConfig<TTaskConfig> = {
  task: CalcMetricsTask<TTaskConfig>;
  onTaskResult?: (result: GenomeMetricsRow) => void;
}

export type MultiprocessingMetricsStrategyConfig<TTaskConfig> = MetricsStrategyConfig<TTaskConfig> & {
  poolSize: number;
}

export type GeneticSearchStrategyConfig<TGenome extends BaseGenome> = {
  populate: PopulateStrategyInterface<TGenome>;
  metrics: MetricsStrategyInterface<TGenome>;
  fitness: FitnessStrategyInterface;
  mutation: MutationStrategyInterface<TGenome>;
  crossover: CrossoverStrategyInterface<TGenome>;
}

export type GeneticSearchReferenceConfig = {
  reference: GenomeMetricsRow;
  weights: GenomeMetricsRow;
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

export interface MetricsStrategyInterface<TGenome extends BaseGenome> {
  run(population: Population<TGenome>): Promise<GenerationMetricsMatrix>;
  clone(): MetricsStrategyInterface<TGenome>;
}

export interface FitnessStrategyInterface {
  score(results: GenerationMetricsMatrix): GenerationFitnessColumn;
}

export interface GeneticSearchInterface<TGenome extends BaseGenome> {
  readonly bestGenome: TGenome;
  readonly partitions: [number, number, number];
  population: Population<TGenome>
  fitStep(): Promise<GenerationFitnessColumn>;
  fit(config: GeneticSearchFitConfig): Promise<void>;
}
