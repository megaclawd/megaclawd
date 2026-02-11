import { TwitterApi } from "twitter-api-v2";
import { AGENT_CONFIG } from "./config.js";

// ============================================
// MEGA CLAWD - Twitter/X Integration
// Autonomous tweeting for the agent economy
// ============================================

export interface TweetResult {
  id: string;
  text: string;
  url: string;
}

export class TwitterClient {
  private client: TwitterApi | null = null;
  private readWrite: TwitterApi | null = null;

  constructor() {
    const appKey = process.env.TWITTER_API_KEY;
    const appSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (appKey && appSecret && accessToken && accessSecret) {
      this.client = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
      });
      this.readWrite = this.client.readWrite as unknown as TwitterApi;
    }
  }

  get isConfigured(): boolean {
    return this.readWrite !== null;
  }

  /**
   * Post a tweet
   */
  async tweet(text: string): Promise<TweetResult> {
    if (!this.readWrite) {
      throw new Error("Twitter API not configured. Set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET in .env");
    }

    console.log(`[MEGA CLAWD Twitter] Posting tweet (${text.length} chars)...`);

    const result = await this.readWrite.v2.tweet(text);

    const tweetUrl = `https://x.com/${AGENT_CONFIG.twitter}/status/${result.data.id}`;
    console.log(`[MEGA CLAWD Twitter] Posted: ${tweetUrl}`);

    return {
      id: result.data.id,
      text: result.data.text,
      url: tweetUrl,
    };
  }

  /**
   * Post a tweet thread (array of tweets)
   */
  async thread(tweets: string[]): Promise<TweetResult[]> {
    if (!this.readWrite) {
      throw new Error("Twitter API not configured");
    }

    console.log(`[MEGA CLAWD Twitter] Posting thread (${tweets.length} tweets)...`);

    const results: TweetResult[] = [];
    let lastTweetId: string | undefined;

    for (const text of tweets) {
      const options: any = {};
      if (lastTweetId) {
        options.reply = { in_reply_to_tweet_id: lastTweetId };
      }

      const result = await this.readWrite.v2.tweet(text, options);
      lastTweetId = result.data.id;

      const tweetUrl = `https://x.com/${AGENT_CONFIG.twitter}/status/${result.data.id}`;
      results.push({
        id: result.data.id,
        text: result.data.text,
        url: tweetUrl,
      });

      console.log(`[MEGA CLAWD Twitter] Tweet ${results.length}/${tweets.length}: ${tweetUrl}`);
    }

    return results;
  }

  /**
   * Reply to a tweet
   */
  async reply(tweetId: string, text: string): Promise<TweetResult> {
    if (!this.readWrite) {
      throw new Error("Twitter API not configured");
    }

    const result = await this.readWrite.v2.tweet(text, {
      reply: { in_reply_to_tweet_id: tweetId },
    });

    const tweetUrl = `https://x.com/${AGENT_CONFIG.twitter}/status/${result.data.id}`;
    console.log(`[MEGA CLAWD Twitter] Replied: ${tweetUrl}`);

    return {
      id: result.data.id,
      text: result.data.text,
      url: tweetUrl,
    };
  }

  /**
   * Get the agent's recent tweets
   */
  async getMyTweets(count: number = 10) {
    if (!this.readWrite) {
      throw new Error("Twitter API not configured");
    }

    const me = await this.readWrite.v2.me();
    const timeline = await this.readWrite.v2.userTimeline(me.data.id, {
      max_results: count,
      "tweet.fields": ["created_at", "public_metrics"],
    });

    return timeline.data.data || [];
  }

  /**
   * Get mentions of the agent
   */
  async getMentions(count: number = 10) {
    if (!this.readWrite) {
      throw new Error("Twitter API not configured");
    }

    const me = await this.readWrite.v2.me();
    const mentions = await this.readWrite.v2.userMentionTimeline(me.data.id, {
      max_results: count,
      "tweet.fields": ["created_at", "author_id", "public_metrics"],
    });

    return mentions.data.data || [];
  }
}
