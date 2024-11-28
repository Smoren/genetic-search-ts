import {
  BaseGenome,
  GeneticSearchInterface,
  PopulationSummary,
  SchedulerConfig,
  SchedulerInterface,
  SchedulerRule,
  SchedulerRuleInput,
} from './types';

export class Scheduler<TGenome extends BaseGenome, TConfig> implements SchedulerInterface {
  protected readonly runner: GeneticSearchInterface<TGenome>;
  protected readonly config: TConfig;
  protected readonly maxHistoryLength: number;
  protected readonly rules: SchedulerRule<TGenome, TConfig>[];
  protected readonly logger: (message: string) => void;
  protected history: PopulationSummary[] = [];

  constructor(params: SchedulerConfig<TGenome, TConfig>) {
    this.runner = params.runner;
    this.config = params.config;
    this.rules = params.rules;
    this.logger = params.logger ?? (() => {});
    this.maxHistoryLength = params.maxHistoryLength;
  }

  public step(): void {
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

  protected getRuleInput(): SchedulerRuleInput<TGenome, TConfig> {
    return {
      runner: this.runner,
      history: this.history,
      config: this.config,
    };
  }
}
