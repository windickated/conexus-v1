import { api_error } from '@errors/index';
import { ViewAPI } from '@service/routes';
import { toastStore } from '@stores/toast';

export class CoNexusApp extends ViewAPI {
  private static instance: CoNexusApp;
  // Constructor
  constructor() {
    super(import.meta.env.PUBLIC_BACKEND);
  }

  static getInstance(): CoNexusApp {
    if (!CoNexusApp.instance) {
      CoNexusApp.instance = new CoNexusApp();
    }
    return CoNexusApp.instance;
  }

  // Fetch the view
  async getSections(): Promise<Section[]> {
    const { data, error } = await this.sections();

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error fetching view', 'error');
      }
      return [];
    }

    return data;
  }

  async getSectionCategories(section: string): Promise<SectionCategory[]> {
    const { data, error } = await this.sectionCategories(section);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error fetching section categories', 'error');
      }
      return [];
    }

    return data;
  }

  async searchSectionCategories(
    section: string,
    topic: string,
  ): Promise<SectionCategory[]> {
    const { data, error } = await this.searchSectionByTopic(section, topic);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error fetching section category', 'error');
      }
      return [];
    }

    return data;
  }

  async getGenres(): Promise<Genre[]> {
    const { data, error } = await this.genres();

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error fetching genres', 'error');
      }
      return [];
    }

    return data.genres;
  }

  async getGenreTopics(genre: string): Promise<SectionCategory[]> {
    const { data, error } = await this.genreTopics(genre);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error fetching genre topics', 'error');
      }
      return [];
    }

    return data;
  }
}
