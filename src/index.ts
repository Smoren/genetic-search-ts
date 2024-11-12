import type {
  BaseGenome,
  Population,
  GenomeMetricsRow,
  GenerationMetricsMatrix,
  CalcMetricsTask,
  GenerationFitnessColumn,
  GenerationAfterCallback,
  GeneticSearchConfig,
  ComposedGeneticSearchConfig,
  BaseMutationStrategyConfig,
  MetricsStrategyConfig,
  MultiprocessingMetricsStrategyConfig,
  GeneticSearchStrategyConfig,
  GeneticSearchFitConfig,
  GeneticSearchReferenceConfig,
  PopulateStrategyInterface,
  MutationStrategyInterface,
  CrossoverStrategyInterface,
  MetricsStrategyInterface,
  FitnessStrategyInterface,
  GeneticSearchInterface,
  IdGeneratorInterface,
  MetricsCacheInterface,
} from "./types";

import {
  GeneticSearch,
  ComposedGeneticSearch,
  IdGenerator,
} from "./classes";

import {
  DummyMetricsCache,
  SimpleMetricsCache,
  AverageMetricsCache,
} from "./cache";

import {
  BaseMutationStrategy,
  BaseMetricsStrategy,
  BaseMultiprocessingMetricsStrategy,
  BaseCachedMultiprocessingMetricsStrategy,
  ReferenceLossFitnessStrategy,
} from './strategies';

import {
  normalizeMetricsRow,
  normalizeMetricsMatrix,
} from "./utils";

export type {
  BaseGenome,
  Population,
  GenomeMetricsRow,
  GenerationMetricsMatrix,
  CalcMetricsTask,
  GenerationFitnessColumn,
  GenerationAfterCallback,
  GeneticSearchConfig,
  ComposedGeneticSearchConfig,
  BaseMutationStrategyConfig,
  MetricsStrategyConfig,
  MultiprocessingMetricsStrategyConfig,
  GeneticSearchStrategyConfig,
  GeneticSearchFitConfig,
  GeneticSearchReferenceConfig,
  PopulateStrategyInterface,
  MutationStrategyInterface,
  CrossoverStrategyInterface,
  MetricsStrategyInterface,
  FitnessStrategyInterface,
  GeneticSearchInterface,
  IdGeneratorInterface,
  MetricsCacheInterface,
};

export {
  GeneticSearch,
  ComposedGeneticSearch,
  BaseMutationStrategy,
  BaseMetricsStrategy,
  BaseMultiprocessingMetricsStrategy,
  BaseCachedMultiprocessingMetricsStrategy,
  ReferenceLossFitnessStrategy,
  IdGenerator,
  DummyMetricsCache,
  SimpleMetricsCache,
  AverageMetricsCache,
  normalizeMetricsRow,
  normalizeMetricsMatrix,
}
