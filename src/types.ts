export type GenomeOrigin = "crossover" | "mutation" | "initial";

export type GenomeStats = {
  age: number;
  fitness: number;
  metrics: GenomeMetricsRow;
  origin: GenomeOrigin;
}

export type BaseGenome = {
  id: number;
  stats?: GenomeStats;
}

export type Population<TGenome extends BaseGenome> = TGenome[];

export type GenomeMetricsRow = number[];
export type GenerationFitnessColumn = number[];
export type GenerationMetricsMatrix = GenomeMetricsRow[];

export type CalcMetricsTask<TTaskConfig> = (data: TTaskConfig) => Promise<GenomeMetricsRow>;
export type GenerationBeforeCallback = (generation: number) => void;
export type GenerationAfterCallback = (generation: number, scores: GenerationFitnessColumn) => void;

export type GeneticSearchConfig = {
  populationSize: number;
  survivalRate: number;
  crossoverRate: number;
};

export type GeneticSearchFitConfig = {
  generationsCount?: number;
  beforeStep?: GenerationBeforeCallback;
  afterStep?: GenerationAfterCallback;
  stopCondition?: (scores: GenerationFitnessColumn) => boolean;
  scheduler?: SchedulerInterface;
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

export type GeneticSearchStrategyConfig<TGenome extends BaseGenome> = {
  populate: PopulateStrategyInterface<TGenome>;
  metrics: MetricsStrategyInterface<TGenome>;
  fitness: FitnessStrategyInterface;
  mutation: MutationStrategyInterface<TGenome>;
  crossover: CrossoverStrategyInterface<TGenome>;
  cache: MetricsCacheInterface;
}

export type GeneticSearchReferenceConfig = {
  reference: GenomeMetricsRow;
  weights: GenomeMetricsRow;
}

export type StatSummary = {
  readonly count: number;
  readonly best: number;
  readonly second: number;
  readonly mean: number;
  readonly median: number;
  readonly worst: number;
}

export type RangeStatSummary = {
  readonly min: number;
  readonly mean: number;
  readonly max: number;
}

export type GroupedStatSummary = {
  readonly initial: StatSummary;
  readonly crossover: StatSummary;
  readonly mutation: StatSummary;
}

export type PopulationSummary = {
  readonly fitnessSummary: StatSummary;
  readonly groupedFitnessSummary: GroupedStatSummary;
  readonly ageSummary: RangeStatSummary;
}

export type SchedulerRuleInput<TGenome extends BaseGenome, TConfig> = {
  runner: GeneticSearchInterface<TGenome>;
  history: PopulationSummary[];
  config: TConfig;
  logger: (message: string) => void;
}

export type SchedulerRule<TGenome extends BaseGenome, TConfig> = {
  condition: (input: SchedulerRuleInput<TGenome, TConfig>) => boolean;
  action: (input: SchedulerRuleInput<TGenome, TConfig>) => void;
}

export type SchedulerConfig<TGenome extends BaseGenome, TConfig> = {
  runner: GeneticSearchInterface<TGenome>;
  config: TConfig;
  rules: SchedulerRule<TGenome, TConfig>[];
  maxHistoryLength: number;
}

export interface PopulateStrategyInterface<TGenome extends BaseGenome> {
  populate(size: number, idGenerator: IdGeneratorInterface<TGenome>): Population<TGenome>;
}

export interface MutationStrategyInterface<TGenome extends BaseGenome> {
  mutate(genome: TGenome, newGenomeId: number): TGenome;
}

export interface CrossoverStrategyInterface<TGenome extends BaseGenome> {
  cross(lhs: TGenome, rhs: TGenome, newGenomeId: number): TGenome;
}

export interface MetricsStrategyInterface<TGenome extends BaseGenome> {
  collect(population: Population<TGenome>, cache: MetricsCacheInterface): Promise<GenerationMetricsMatrix>;
}

export interface FitnessStrategyInterface {
  score(results: GenerationMetricsMatrix): GenerationFitnessColumn;
}

export interface GeneticSearchInterface<TGenome extends BaseGenome> {
  readonly bestGenome: TGenome;
  readonly partitions: [number, number, number];
  readonly cache: MetricsCacheInterface;
  readonly generation: number;
  population: Population<TGenome>;
  setPopulation(population: Population<TGenome>, resetIdGenerator: boolean): void;
  getPopulationSummary(roundPrecision?: number): PopulationSummary;
  fitStep(scheduler?: SchedulerInterface): Promise<GenerationFitnessColumn>;
  clearCache(): void;
  fit(config: GeneticSearchFitConfig): Promise<void>;
}

export interface IdGeneratorInterface<TGenome extends BaseGenome> {
  nextId(): number;
  reset(population: TGenome[]): void;
}

export interface MetricsCacheInterface {
  getReady(genomeId: number): GenomeMetricsRow | undefined;
  get(genomeId: number, defaultValue?: GenomeMetricsRow): GenomeMetricsRow | undefined;
  set(genomeId: number, metrics: GenomeMetricsRow): void;
  clear(excludeGenomeIds: number[]): void;
  export(): Record<number, unknown>;
  import(data: Record<number, unknown>): void;
}

export interface GenomeStatsManagerInterface<TGenome extends BaseGenome> {
  init(population: Population<TGenome>, origin: GenomeOrigin): void;
  update(
    population: Population<TGenome>,
    metricsMatrix: GenerationMetricsMatrix,
    fitnessColumn: GenerationFitnessColumn,
  ): void;
}

export interface PopulationSummaryManagerInterface<TGenome extends BaseGenome> {
  get(): PopulationSummary;
  getRounded(precision: number): PopulationSummary;
  update(sortedPopulation: Population<TGenome>): void;
}

export interface SchedulerInterface {
  readonly logs: string[];
  step(): void;
}
