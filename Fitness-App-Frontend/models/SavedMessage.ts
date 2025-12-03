import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';
import { Database } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';

export class SavedMessage extends Model {
  static table = 'saved_messages';

  @field('user_id') userId!: string;
  @field('message_text') messageText!: string;
  @field('message_type') messageType!: string; // 'user' or 'ai'
  @field('saved_at') savedAt!: number;

  // Static methods for database operations
  static async saveMessage(
    database: Database,
    userId: string,
    messageText: string,
    messageType: 'user' | 'ai'
  ) {
    const savedMessagesCollection = database.collections.get<SavedMessage>('saved_messages');
    
    await database.write(async () => {
      await savedMessagesCollection.create((message) => {
        message.userId = userId;
        message.messageText = messageText;
        message.messageType = messageType;
        message.savedAt = Date.now();
      });
    });
  }

  static async getSavedMessages(database: Database, userId: string): Promise<SavedMessage[]> {
    const savedMessagesCollection = database.collections.get<SavedMessage>('saved_messages');
    
    const messages = await savedMessagesCollection
      .query(
        Q.where('user_id', userId),
        Q.sortBy('saved_at', Q.desc)
      )
      .fetch();
    
    return messages;
  }

  static async deleteMessage(database: Database, messageId: string) {
    const savedMessagesCollection = database.collections.get<SavedMessage>('saved_messages');
    const message = await savedMessagesCollection.find(messageId);
    
    await database.write(async () => {
      await message.destroyPermanently();
    });
  }

  static async clearAllMessages(database: Database, userId: string) {
    const savedMessagesCollection = database.collections.get<SavedMessage>('saved_messages');
    const messages = await savedMessagesCollection
      .query(Q.where('user_id', userId))
      .fetch();
    
    await database.write(async () => {
      await Promise.all(messages.map(message => message.destroyPermanently()));
    });
  }
}
