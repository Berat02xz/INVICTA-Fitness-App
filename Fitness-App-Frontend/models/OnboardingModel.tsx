import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export class OnboardingModel extends Model {
  static table = 'onboarding_answers';

  @text('question') question!: string;
  @text('answer') answer!: string;
}
