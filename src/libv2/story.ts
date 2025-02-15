import { api_error } from '@errors/index';
import { GameAPI } from '@service/routes';
import { background_image, background_music } from '@stores/conexus';
import { story, loading } from '@stores/conexus';
import { toastStore } from '@stores/toast';

import { tracks } from 'src/libv2/constants';

export let storyTitle: string;

export class CoNexusGame extends GameAPI {
  // Properties
  // readonly #id: string; // The ID of the game.

  private static instance: CoNexusGame;

  game_data: GameData; // The data for the current step of the story.
  maxStep: number = 0; // The maximum step number of the story.

  hasFetched = false; // Whether the story has been fetched.
  jobID: string; // The ID of the job (Image) that is currently running.

  interval: NodeJS.Timer | null = null; // The interval for checking the status of the job.

  // Constructor
  constructor(data?: GameData) {
    super(import.meta.env.PUBLIC_BACKEND);

    // this.#id = id;
    this.game_data = {} as GameData;
    if (data) {
      this.setStepData(data); // ✅ Works now
    }
  }

  static getInstance(): CoNexusGame {
    if (!CoNexusGame.instance) {
      CoNexusGame.instance = new CoNexusGame();
    }
    return CoNexusGame.instance;
  }

  async getTopic(topic: string): Promise<SectionTopic> {
    const { data, error } = await this.topicByName(topic);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error fetching topic', 'error');
      }
      throw new Error('Error fetching topic');
    }

    console.log(data);

    return data;
  }

  async fetch_story_image(
    category: string,
    type: 'tile' | 'description',
  ): Promise<string | null> {
    let formattedFileName = CoNexusGame.#formatFileName(category);
    let folderUrl = `https://media.degenerousdao.com/conexus-categories/images/${formattedFileName}/description/${type}.avif`;

    let valid = await CoNexusGame.#isValidImageUrl(folderUrl);
    if (valid) {
      return folderUrl;
    }

    return null;
  }

  async storyContinuables(topic: string): Promise<ContinuableStory[]> {
    const { data, error } = await this.continuablesByTopic(topic);

    if (!data) {
      if (error) {
        api_error(error);
      }
      return [];
    }

    return data;
  }

  async delete(story_id: string): Promise<void> {
    const { error } = await this.deleteStory(story_id);

    if (error) {
      api_error(error);
    }
  }

  // Start New Game
  async startGame(story_name: string): Promise<void> {
    loading.set(true);

    const { data, error } = await this.start(story_name);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error starting game', 'error');
      }
      return;
    }

    CoNexusGame.setBackgroundImage(story_name);
    CoNexusGame.playBackgroundMusic(story_name);

    // Initialize game
    const game = new CoNexusGame();

    await game.setStepData(data); // ✅ Use this instead of new instance
  }

  // Continue pre-existing game
  async continueGame(continuable: ContinuableStory): Promise<void> {
    // Start new game
    const { data, error } = await this.continue(continuable.story_id);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error continuing game', 'error');
      }
      return;
    }

    // Set background image and music
    CoNexusGame.setBackgroundImage(continuable.category);
    CoNexusGame.playBackgroundMusic(continuable.category);

    // Initialize game
    const game = new CoNexusGame();
    // Set step data
    await game.setStepData(data);
  }

  // Respond to the current game step
  async nextStep(choice: number): Promise<void> {
    // set store loading to true
    loading.set(true);

    // Start new game
    const { data, error } = await this.respond(this.game_data.id, choice);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error playing game', 'error');
      }
      return;
    }

    // Set step data
    await this.setStepData(data);
  }

  // Load the specified step of the game
  async loadGameStep(step: number): Promise<void> {
    const { data, error } = await this.loadStep(this.game_data.id, step);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error loading game step', 'error');
      }
      return;
    }

    this.game_data = data;
    story.set({ ...this });

    await this.#loadGameStepImage(step);
  }

  /* Media */

  // Play background music
  private static async playBackgroundMusic(story_name: string): Promise<void> {
    let queue: string[] = JSON.parse(localStorage.getItem('queue') ?? '[]');
    let categoryTrackURL: string | null = null;

    if (story_name) {
      categoryTrackURL = await this.#fetchRandomMusicUrl(story_name);
      if (categoryTrackURL) {
        const categoryFileExists = await fetch(categoryTrackURL).then(
          (res) => res.ok,
        );

        if (categoryFileExists) {
          background_music.set(categoryTrackURL);
          return;
        }
      }
    }

    if (queue.length === 0) {
      queue = this.#shuffle([...tracks]);
    }

    background_music.set(queue.pop());

    localStorage.setItem('queue', JSON.stringify(queue));
  }

  // Get story background image
  private static async setBackgroundImage(story_name: string) {
    let url = await this.#fetch_background_image(story_name);

    if (url) {
      background_image.set(url);
    }
  }

  // Load the specified step image
  async #loadGameStepImage(step: number): Promise<void> {
    const { data, error } = await this.loadStepImage(this.game_data.id, step);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error loading game step image', 'error');
      }
      return;
    }

    this.game_data.image = data;
    story.set({ ...this });
  }

  // Generate image for current step v2
  async #generateImage(): Promise<void> {
    const { data, error } = await this.imageV2(this.game_data.id);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error getting image', 'error');
      }
      return;
    }

    this.jobID = data.jobID;
    this.hasFetched = true;
    this.#start_interval();
  }

  // Generate image status v2
  async #generateImageStatus(): Promise<void> {
    const { data, error } = await this.imageStatusV2(
      this.game_data.id,
      this.jobID,
    );

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error getting image status', 'error');
      }
      return;
    }

    if (data.status === 'ready') {
      this.game_data.image = data.image;
      story.set({ ...this });
      this.#clear_interval();
    }
  }

  // Text to speech
  async #textToSpeech(): Promise<void> {
    const { data, error } = await this.getTTS(this.game_data.id);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error getting TTS', 'error');
      }
      return;
    }

    this.game_data.tts = data;
    story.set({ ...this });
  }

  /* Helper */
  private async setStepData(data: GameData): Promise<void> {
    this.game_data = data;
    this.maxStep = Math.max(this.maxStep, data.step);

    story.set({ ...this });
    loading.set(false);

    await Promise.all([this.#generateImage(), this.#textToSpeech()]);
  }

  static #formatFileName(category: string): string {
    let fileName = category.toLowerCase();
    let formattedFileName = fileName.replace(/[\s.\-\/]+/g, '');

    storyTitle = category;

    return formattedFileName;
  }

  static #isValidImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  }

  static async #fetchRandomMusicUrl(category: string): Promise<string | null> {
    const formattedFileName = this.#formatFileName(category);

    const folderURL = `https://media.degenerousdao.com/conexus-categories/music/${formattedFileName}`;

    const response = await fetch(folderURL);

    if (!response.ok) {
      return null;
    }

    const files = await response.json();

    if (Array.isArray(files) && files.length > 0) {
      let randomFile = files[Math.floor(Math.random() * files.length)];
      let url = `${folderURL}/${randomFile.name}`;

      return url;
    }

    return null;
  }

  static async #fetch_background_image(
    category: string,
  ): Promise<string | null> {
    let formattedFileName = this.#formatFileName(category);
    let folderUrl = `https://media.degenerousdao.com/conexus-categories/images/${formattedFileName}/backgrounds`;

    let response = await fetch(folderUrl);
    let files = await response.json();

    if (Array.isArray(files) && files.length > 0) {
      let randomFile = files[Math.floor(Math.random() * files.length)];
      let url = `${folderUrl}/${randomFile.name}`;

      let valid = await this.#isValidImageUrl(url);
      if (valid) {
        return url;
      }
    }

    return null;
  }

  static #shuffle = <T>(array: T[]): T[] => {
    let currentIndex = array.length,
      randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  };

  #start_interval() {
    this.interval = setInterval(async () => {
      await this.#generateImageStatus();
    }, 10000);
  }

  #clear_interval() {
    if (this.interval) {
      clearInterval(this.interval as NodeJS.Timeout);
      this.interval = null;
    }
  }
}






// import { api_error } from '@errors/index';
// import { GameAPI } from '@service/routes';
// import { background_image, background_music } from '@stores/conexus';
// import { story, loading } from '@stores/conexus';
// import { toastStore } from '@stores/toast';

// import { tracks } from 'src/libv2/constants';

// const gameAPI = new GameAPI(import.meta.env.PUBLIC_BACKEND);

// export let storyTitle: string;

// export class CoNexusGame {
//   // Properties
//   readonly #id: string; // The ID of the game.

//   game_data: GameData; // The data for the current step of the story.
//   maxStep: number = 0; // The maximum step number of the story.

//   hasFetched = false; // Whether the story has been fetched.
//   jobID: string; // The ID of the job (Image) that is currently running.

//   interval: NodeJS.Timer | null = null; // The interval for checking the status of the job.

//   // Constructor
//   constructor(id: string) {
//     this.#id = id;
//   }

//   static async getTopic(topic: string): Promise<SectionTopic> {
//     const { data, error } = await gameAPI.topicByName(topic);

//     if (!data) {
//       if (error) {
//         api_error(error);
//       } else {
//         toastStore.show('Error fetching topic', 'error');
//       }
//       throw new Error('Error fetching topic');
//     }

//     console.log(data);

//     return data;
//   }

//   static async fetch_story_image(
//     category: string,
//     type: 'tile' | 'description',
//   ): Promise<string | null> {
//     let formattedFileName = CoNexusGame.#formatFileName(category);
//     let folderUrl = `https://media.degenerousdao.com/conexus-categories/images/${formattedFileName}/description/${type}.avif`;

//     let valid = await CoNexusGame.#isValidImageUrl(folderUrl);
//     if (valid) {
//       return folderUrl;
//     }

//     return null;
//   }

//   static async storyContinuables(topic: string): Promise<ContinuableStory[]> {
//     const { data, error } = await gameAPI.continuablesByTopic(topic);

//     if (!data) {
//       if (error) {
//         api_error(error);
//       }
//       return [];
//     }

//     return data;
//   }

//   static async delete(story_id: string): Promise<void> {
//     const { error } = await gameAPI.deleteStory(story_id);

//     if (error) {
//       api_error(error);
//     }
//   }

//   // Start New Game
//   static async startGame(story_name: string): Promise<void> {
//     loading.set(true);

//     const { data, error } = await gameAPI.start(story_name);

//     if (!data) {
//       if (error) {
//         api_error(error);
//       } else {
//         toastStore.show('Error starting game', 'error');
//       }
//       return;
//     }

//     CoNexusGame.#setBackgroundImage(story_name);
//     CoNexusGame.#playBackgroundMusic(story_name);

//     // Initialize game
//     const game = new CoNexusGame(data.id);

//     await game.#setStepData(data); // ✅ Use this instead of new instance
//   }

//   // Continue pre-existing game
//   static async continueGame(continuable: ContinuableStory): Promise<void> {
//     // Start new game
//     const { data, error } = await gameAPI.continue(continuable.story_id);

//     if (!data) {
//       if (error) {
//         api_error(error);
//       } else {
//         toastStore.show('Error continuing game', 'error');
//       }
//       return;
//     }

//     // Set background image and music
//     CoNexusGame.#setBackgroundImage(continuable.category);
//     CoNexusGame.#playBackgroundMusic(continuable.category);

//     // Initialize game
//     const game = new CoNexusGame(data.id);
//     // Set step data
//     await game.#setStepData(data);
//   }

//   // Respond to the current game step
//   async nextStep(choice: number): Promise<void> {
//     // set store loading to true
//     loading.set(true);

//     // Start new game
//     const { data, error } = await gameAPI.respond(this.#id, choice);

//     if (!data) {
//       if (error) {
//         api_error(error);
//       } else {
//         toastStore.show('Error playing game', 'error');
//       }
//       return;
//     }

//     // Set step data
//     await this.#setStepData(data);
//   }

//   // Load the specified step of the game
//   async loadGameStep(step: number): Promise<void> {
//     const { data, error } = await gameAPI.loadStep(this.#id, step);

//     if (!data) {
//       if (error) {
//         api_error(error);
//       } else {
//         toastStore.show('Error loading game step', 'error');
//       }
//       return;
//     }

//     this.game_data = data;
//     story.set(this);

//     await this.#loadGameStepImage(step);
//   }

//   /* Media */

//   // Play background music
//   static async #playBackgroundMusic(story_name: string): Promise<void> {
//     let queue: string[] = JSON.parse(localStorage.getItem('queue') ?? '[]');
//     let categoryTrackURL: string | null = null;

//     if (story_name) {
//       categoryTrackURL = await this.#fetchRandomMusicUrl(story_name);
//       if (categoryTrackURL) {
//         const categoryFileExists = await fetch(categoryTrackURL).then(
//           (res) => res.ok,
//         );

//         if (categoryFileExists) {
//           background_music.set(categoryTrackURL);
//           return;
//         }
//       }
//     }

//     if (queue.length === 0) {
//       queue = this.#shuffle([...tracks]);
//     }

//     background_music.set(queue.pop());

//     localStorage.setItem('queue', JSON.stringify(queue));
//   }

//   // Get story background image
//   static async #setBackgroundImage(story_name: string) {
//     let url = await this.#fetch_background_image(story_name);

//     if (url) {
//       background_image.set(url);
//     }
//   }

//   // Load the specified step image
//   async #loadGameStepImage(step: number): Promise<void> {
//     const { data, error } = await gameAPI.loadStepImage(
//       this.game_data.id,
//       step,
//     );

//     if (!data) {
//       if (error) {
//         api_error(error);
//       } else {
//         toastStore.show('Error loading game step image', 'error');
//       }
//       return;
//     }

//     this.game_data.image = data;
//     story.set({ ...this });
//   }

//   // Generate image for current step v2
//   async #generateImage(): Promise<void> {
//     const { data, error } = await gameAPI.imageV2(this.game_data.id);

//     if (!data) {
//       if (error) {
//         api_error(error);
//       } else {
//         toastStore.show('Error getting image', 'error');
//       }
//       return;
//     }

//     this.jobID = data.jobID;
//     this.hasFetched = true;
//     this.#start_interval();
//   }

//   // Generate image status v2
//   async #generateImageStatus(): Promise<void> {
//     const { data, error } = await gameAPI.imageStatusV2(
//       this.game_data.id,
//       this.jobID,
//     );

//     if (!data) {
//       if (error) {
//         api_error(error);
//       } else {
//         toastStore.show('Error getting image status', 'error');
//       }
//       return;
//     }

//     if (data.status === 'ready') {
//       this.game_data.image = data.image;
//       story.set({ ...this });
//       this.#clear_interval();
//     }
//   }

//   // Text to speech
//   async #textToSpeech(): Promise<void> {
//     const { data, error } = await gameAPI.getTTS(this.game_data.id);

//     if (!data) {
//       if (error) {
//         api_error(error);
//       } else {
//         toastStore.show('Error getting TTS', 'error');
//       }
//       return;
//     }

//     this.game_data.tts = data;
//     story.set({ ...this });
//   }

//   /* Helper */
//   async #setStepData(data: GameData): Promise<void> {
//     this.game_data = data;
//     this.maxStep = Math.max(this.maxStep, data.step);

//     story.set({ ...this });
//     loading.set(false);

//     await Promise.all([this.#generateImage(), this.#textToSpeech()]);
//   }

//   static #formatFileName(category: string): string {
//     let fileName = category.toLowerCase();
//     let formattedFileName = fileName.replace(/[\s.\-\/]+/g, '');

//     storyTitle = category;

//     return formattedFileName;
//   }

//   static #isValidImageUrl(url: string): Promise<boolean> {
//     return new Promise((resolve) => {
//       const img = new Image();
//       img.src = url;
//       img.onload = () => resolve(true);
//       img.onerror = () => resolve(false);
//     });
//   }

//   static async #fetchRandomMusicUrl(category: string): Promise<string | null> {
//     const formattedFileName = this.#formatFileName(category);

//     const folderURL = `https://media.degenerousdao.com/conexus-categories/music/${formattedFileName}`;

//     const response = await fetch(folderURL);

//     if (!response.ok) {
//       return null;
//     }

//     const files = await response.json();

//     if (Array.isArray(files) && files.length > 0) {
//       let randomFile = files[Math.floor(Math.random() * files.length)];
//       let url = `${folderURL}/${randomFile.name}`;

//       return url;
//     }

//     return null;
//   }

//   static async #fetch_background_image(
//     category: string,
//   ): Promise<string | null> {
//     let formattedFileName = this.#formatFileName(category);
//     let folderUrl = `https://media.degenerousdao.com/conexus-categories/images/${formattedFileName}/backgrounds`;

//     let response = await fetch(folderUrl);
//     let files = await response.json();

//     if (Array.isArray(files) && files.length > 0) {
//       let randomFile = files[Math.floor(Math.random() * files.length)];
//       let url = `${folderUrl}/${randomFile.name}`;

//       let valid = await this.#isValidImageUrl(url);
//       if (valid) {
//         return url;
//       }
//     }

//     return null;
//   }

//   static #shuffle = <T>(array: T[]): T[] => {
//     let currentIndex = array.length,
//       randomIndex: number;

//     while (currentIndex !== 0) {
//       randomIndex = Math.floor(Math.random() * currentIndex);
//       currentIndex--;

//       [array[currentIndex], array[randomIndex]] = [
//         array[randomIndex],
//         array[currentIndex],
//       ];
//     }

//     return array;
//   };

//   #start_interval() {
//     this.interval = setInterval(async () => {
//       await this.#generateImageStatus();
//     }, 10000);
//   }

//   #clear_interval() {
//     if (this.interval) {
//       clearInterval(this.interval as NodeJS.Timeout);
//       this.interval = null;
//     }
//   }
// }
