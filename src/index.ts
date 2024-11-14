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
} from "./genetic";

import {
  DummyMetricsCache,
  SimpleMetricsCache,
  AverageMetricsCache,
  WeightedAgeAverageMetricsCache,
} from "./cache";

import {
  BaseMutationStrategy,
  BaseMetricsStrategy,
  BaseMultiprocessingMetricsStrategy,
  ReferenceLossFitnessStrategy,
} from './strategies';

import {
  IdGenerator,
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
  ReferenceLossFitnessStrategy,
  IdGenerator,
  DummyMetricsCache,
  SimpleMetricsCache,
  AverageMetricsCache,
  WeightedAgeAverageMetricsCache,
  normalizeMetricsRow,
  normalizeMetricsMatrix,
}
