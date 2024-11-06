import type {
  BaseGenome,
  Population,
  GenomeMetricsRow,
  GenerationMetricsMatrix,
  CalcMetricsTask,
  GenerationFitnessColumn,
  GenerationCallback,
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
  NextIdGetter,
} from "./types";

import {
  GeneticSearch,
  ComposedGeneticSearch,
} from "./classes";

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
  GenerationCallback,
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
  NextIdGetter,
};

export {
  GeneticSearch,
  ComposedGeneticSearch,
  BaseMutationStrategy,
  BaseMetricsStrategy,
  BaseMultiprocessingMetricsStrategy,
  BaseCachedMultiprocessingMetricsStrategy,
  ReferenceLossFitnessStrategy,
  normalizeMetricsRow,
  normalizeMetricsMatrix,
}
