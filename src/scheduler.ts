import type {
  BaseGenome,
  GeneticSearchInterface,
  PopulationSummary,
  SchedulerConfig,
  SchedulerInterface,
  SchedulerRule,
  SchedulerRuleInput,
} from './types';

/**
 * A scheduler for a genetic search algorithm.
 *
 * The scheduler is responsible for executing scheduled tasks or operations
 * in the genetic search algorithm.
 *
 * @template TGenome The type of genome objects in the population.
 * @template TConfig The type of configuration object of macro parameters,
 * which the scheduler will be able to manipulate.
 */
export class Scheduler<TGenome extends BaseGenome, TConfig> implements SchedulerInterface {
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
  protected readonly rules: SchedulerRule<TGenome, TConfig>[];

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
    this.rules = params.rules;
    this.maxHistoryLength = params.maxHistoryLength;
    this.logger = (message: string) => {
      this.logs.push(message);
    }
  }

  public step(): void {
    this.clearLogs();
    this.handleHistory();
    for (const rule of this.rules) {
      const ruleInput = this.getRuleInput();
      if (rule.condition(ruleInput)) {
        rule.action(ruleInput);
      }
    }
  }

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
  protected getRuleInput(): SchedulerRuleInput<TGenome, TConfig> {
    return {
      runner: this.runner,
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
