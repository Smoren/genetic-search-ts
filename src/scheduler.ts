import {
  BaseGenome,
  GeneticSearchInterface,
  PopulationSummary,
  SchedulerConfig,
  SchedulerInterface,
  SchedulerAction,
  SchedulerActionInput, Population, EvaluatedGenome,
} from "./types";
import { ArrayManager } from "./utils";

/**
 * A scheduler for a genetic search algorithm.
 *
 * The scheduler is responsible for executing scheduled tasks or operations
 * in the genetic search algorithm.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration object of macro parameters,
 * which the scheduler will be able to manipulate.
 *
 * @category Scheduler
 */
export class Scheduler<TGenome extends BaseGenome, TConfig> implements SchedulerInterface<TGenome> {
  /**
   * An array of log messages generated by the scheduler.
   */
  public readonly logs: string[] = [];

  /**
   * A function to log messages.
   *
   * @param message - The message to log.
   */
  protected readonly logger: (message: string) => void;

  /**
   * The genetic search runner.
   */
  protected readonly runner: GeneticSearchInterface<TGenome>;

  /**
   * The configuration object of macro parameters, which the scheduler will be able to manipulate.
   */
  protected readonly config: TConfig;

  /**
   * The maximum length of the history array.
   */
  protected readonly maxHistoryLength: number;

  /**
   * The rules applied by the scheduler.
   */
  protected readonly actions: SchedulerAction<TGenome, TConfig>[];

  /**
   * The history of population summaries.
   */
  protected history: PopulationSummary[] = [];

  /**
   * Constructor of the Scheduler class.
   *
   * @param params - The parameters to initialize the scheduler.
   */
  constructor(params: SchedulerConfig<TGenome, TConfig>) {
    this.runner = params.runner;
    this.config = params.config;
    this.actions = params.actions;
    this.maxHistoryLength = params.maxHistoryLength;
    this.logger = (message: string) => {
      this.logs.push(message);
    }
  }

  /**
   * Executes a single step or iteration in the scheduler.
   */
  public step(evaluatedPopulation: EvaluatedGenome<TGenome>[]): void {
    this.clearLogs();
    this.handleHistory();
    for (const rule of this.actions) {
      try {
        rule(this.getRuleInput(evaluatedPopulation));
      } catch (e) {
        if ((e as Error).name === 'SchedulerConditionException') {
          continue;
        }
        throw e;
      }
    }
  }

  /**
   * Handles the history of population summaries.
   *
   * Adds the current population summary to the history. If the history
   * exceeds the maximum allowed length, it trims the oldest entries.
   */
  protected handleHistory(): void {
    this.history.push(this.runner.getPopulationSummary());
    if (this.history.length >= this.maxHistoryLength) {
      this.history = this.history.slice(this.history.length - this.maxHistoryLength);
    }
  }

  /**
   * Constructs the input data for a scheduler rule.
   *
   * This input is used by both the `condition` and `action` functions
   * of a scheduler rule.
   *
   * @returns An object containing the runner, history, config, and logger.
   */
  protected getRuleInput(evaluatedPopulation: EvaluatedGenome<TGenome>[]): SchedulerActionInput<TGenome, TConfig> {
    const evaluatedPopulationManager = new ArrayManager(evaluatedPopulation);
    return {
      runner: this.runner,
      evaluatedPopulation,
      evaluatedPopulationManager,
      history: this.history,
      config: this.config,
      logger: this.logger,
    };
  }

  /**
   * Clears all the logs stored in the scheduler.
   */
  protected clearLogs(): void {
    this.logs.length = 0;
  }
}

/**
 * An exception thrown when a scheduler condition is not satisfied.
 *
 * This exception is thrown when a scheduler rule's condition function
 * returns false.
 *
 * @category Exceptions
 * @category Scheduler
 */
export class SchedulerConditionException extends Error {
  constructor() {
    super();
    this.name = 'SchedulerConditionException';
  }
}

/**
 * Checks if a scheduler condition is satisfied.
 *
 * If the condition is not satisfied, this function throws a {@link SchedulerConditionException}`.
 *
 * @see SchedulerConditionException
 *
 * @param condition - The result of the scheduler condition check.
 *
 * @category Scheduler
 */
export function checkSchedulerCondition(condition: boolean): void {
  if (!condition) {
    throw new SchedulerConditionException();
  }
}
