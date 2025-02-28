import { api_error } from '@errors/index';
import { AccountAPI, AuthAPI } from '@service/routes';
import { authenticated, referralCodes, web3LoggedIn } from '@stores/account';
import { toastStore } from '@stores/toast';
import { accountError } from '@stores/account';

export class Account {
  private accountAPI: AccountAPI;
  private authAPI: AuthAPI;

  constructor() {
    this.accountAPI = new AccountAPI(import.meta.env.PUBLIC_BACKEND);
    this.authAPI = new AuthAPI(import.meta.env.PUBLIC_BACKEND);
  }

  async signin(signinData: SignIn): Promise<void> {
    const { data, error } = await this.authAPI.signin(
      signinData.email,
      signinData.password,
    );

    if (!data) {
      if (error) {
        accountError.set({ signin: error.message });
      } else {
        accountError.set({ signin: 'Error signing in' });
      }
      return;
    }

    authenticated.set({ user: data.user, loggedIn: true });
    web3LoggedIn.set(true);
  }

  async signup(signupData: ReferralSignUp): Promise<void> {
    const { data, error } = await this.authAPI.signup(signupData);

    if (!data) {
      if (error) {
        accountError.set({ signup: error.message });
      } else {
        accountError.set({ signup: 'Error signing up' });
      }
      return;
    }

    authenticated.set({ user: data.user, loggedIn: true });
    web3LoggedIn.set(true);
  }

  async validateReferralCode(code: string): Promise<ReferralCode | null> {
    const { data, error } = await this.authAPI.validateReferralCode(code);

    if (!data) {
      if (error) {
        accountError.set({ validateReferralCode: error.message });
      } else {
        accountError.set({
          validateReferralCode: 'Error validating referral code',
        });
      }
      return null;
    }

    return data.referral;
  }

  async googleSignin(): Promise<void> {
    const { data, error } = await this.authAPI.googleSignin();

    if (!data) {
      if (error) {
        accountError.set({ googleSignin: error.message });
      } else {
        accountError.set({ googleSignin: 'Error signing in with google' });
      }
      return;
    }

    window.location.href = data.url;
  }

  async confirmEmail(token: string): Promise<boolean> {
    const { data, error } = await this.accountAPI.confirmEmail(token);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error confirming email', 'error');
      }
      return false;
    }

    toastStore.show(data.message || 'Email confirmed successfully', 'info');
    return true;
  }

  async subscribeNewsletter(): Promise<void> {
    const { data, error } = await this.accountAPI.subscribeNewsletter();

    if (!data) {
      if (error) {
        accountError.set({ subscribeNewsletter: error.message });
      } else {
        accountError.set({
          subscribeNewsletter: 'Error subscribing to newsletter',
        });
      }
      return;
    }

    // toastStore.show(data.message || 'Subscribed to newsletter', 'info');
  }

  async unsubscribeNewsletter(): Promise<void> {
    const { data, error } = await this.accountAPI.unsubscribeNewsletter();

    if (!data) {
      if (error) {
        accountError.set({ unsubscribeNewsletter: error.message });
      } else {
        accountError.set({
          unsubscribeNewsletter: 'Error unsubscribing from newsletter',
        });
      }
      return;
    }

    // toastStore.show(data.message || 'Unsubscribed from newsletter', 'info');
  }

  async subscriptionStatus(): Promise<SubscriptionStatus> {
    const { data, error } = await this.accountAPI.subscriptionStatus();

    if (!data) {
      if (error) {
        api_error(error);
        accountError.set({ subscriptionStatus: error.message });
      } else {
        toastStore.show('Error getting subscription status', 'error');
      }
      return { is_active: false, subscribed_at: null, unsubscribed_at: null };
    }

    return data;
  }

  async forgotPassword(email: string): Promise<void> {
    const { data, error } = await this.authAPI.forgotPassword(email);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error sending forgot passowrd', 'error');
      }
      return;
    }

    toastStore.show(data.message || 'Password reset email sent', 'info');
  }

  async resetPassword(resetData: ResetPassword): Promise<void> {
    const { data, error } = await this.authAPI.resetPassword(
      resetData.email,
      resetData.token,
      resetData.password,
    );

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error resetting password', 'error');
      }
      return;
    }

    toastStore.show(data.message || 'Password reset successfully', 'info');
  }

  /* Account API */

  async me(): Promise<void> {
    const { data, error } = await this.accountAPI.me();

    if (!data) {
      if (error) {
        api_error(error, false);
      } else {
        toastStore.show('Error getting current user', 'error');
      }
      return;
    }

    authenticated.set({ user: data.user, loggedIn: true });
    web3LoggedIn.set(true);
  }

  static async getUser(): Promise<User | null> {
    const accountAPI = new AccountAPI(import.meta.env.PUBLIC_BACKEND);
    const { data, error } = await accountAPI.me();

    if (!data) {
      if (error) {
        api_error(error);
      }
      return null;
    }

    return data.user;
  }

  async changePassword(changePasswrodData: ChangePassword): Promise<void> {
    const { data, error } = await this.accountAPI.changePassword(
      changePasswrodData.old_password,
      changePasswrodData.new_password,
    );

    if (!data) {
      if (error) {
        accountError.set({ changePassword: error.message });
      } else {
        accountError.set({ changePassword: 'Error changing password' });
      }
      return;
    }

    // toastStore.show(data.message || 'Password changed successfully', 'info');
  }

  async signout(): Promise<void> {
    const { data, error } = await this.accountAPI.logout();

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error signing out', 'error');
      }
      return;
    }

    authenticated.set({ user: null, loggedIn: false });
    web3LoggedIn.set(false);
    window.open('/', '_self');
  }

  async selectMainWallet(wallet: string): Promise<void> {
    const { data, error } = await this.accountAPI.web3SelectWallet(wallet);

    if (!data) {
      if (error) {
        accountError.set({ selectMainWallet: error.message });
      } else {
        accountError.set({ selectMainWallet: 'Error changing wallet' });
      }
      return;
    }

    authenticated.set({ user: data.user, loggedIn: true });
    web3LoggedIn.set(true);
  }

  async generateReferralCode(): Promise<void> {
    const { data, error } = await this.accountAPI.createReferralCodes();

    if (!data) {
      if (error) {
        accountError.set({ generateReferralCode: error.message });
      } else {
        accountError.set({
          generateReferralCode: 'Error generating referral codes',
        });
      }
      return;
    }

    referralCodes.set(data.codes);
    window.location.reload();
  }

  async getReferraLCodes(): Promise<void> {
    const { data, error } = await this.accountAPI.getReferralCodes();

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error getting referral codes', 'error');
      }
      return;
    }

    referralCodes.set(data.codes);
  }

  async useReferralCode(code: string): Promise<void> {
    const { data, error } = await this.accountAPI.useReferralCode(code);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error using referral code', 'error');
      }
      return;
    }

    toastStore.show(data.message || 'Referral code used successfully', 'info');
  }
}
