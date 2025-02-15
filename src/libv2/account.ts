import { api_error } from '@errors/index';
import { AccountAPI, AuthAPI } from '@service/routes';
import { authenticated, referralCodes, web3LoggedIn } from '@stores/account';
import { toastStore } from '@stores/toast';

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
        api_error(error);
      } else {
        toastStore.show('Error signing in', 'error');
      }
      return;
    }

    authenticated.set({ user: data.user, loggedIn: true });
  }

  async signup(signupData: ReferralSignUp): Promise<void> {
    const { data, error } = await this.authAPI.signup(signupData);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error signing up', 'error');
      }
      return;
    }

    authenticated.set({ user: data.user, loggedIn: true });
  }

  async googleSignin(): Promise<void> {
    const { data, error } = await this.authAPI.googleSignin();

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error signing up with google', 'error');
      }
      return;
    }

    window.location.href = data.url;
  }

  async confirmEmail(email: string, token: string): Promise<void> {
    const { data, error } = await this.authAPI.confirmEmail(email, token);

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error confirming email', 'error');
      }
      return;
    }

    toastStore.show(data.message || 'Email confirmed successfully', 'info');
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
        api_error(error);
      } else {
        toastStore.show('Error getting current user', 'error');
      }
      return;
    }

    authenticated.set({ user: data.user, loggedIn: true });
  }

  async changePassword(changePasswrodData: ChangePassword): Promise<void> {
    const { data, error } = await this.accountAPI.changePassword(
      changePasswrodData.old_password,
      changePasswrodData.new_password,
    );

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error changing password', 'error');
      }
      return;
    }

    toastStore.show(data.message || 'Password changed successfully', 'info');
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
        api_error(error);
      } else {
        toastStore.show('Error changing wallet', 'error');
      }
      return;
    }

    authenticated.set({ user: data.user, loggedIn: true });
  }

  async generateReferralCode(): Promise<void> {
    const { data, error } = await this.accountAPI.createReferralCodes();

    if (!data) {
      if (error) {
        api_error(error);
      } else {
        toastStore.show('Error signigenerating referral codes', 'error');
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

  async validateReferralCode(code: string): Promise<ReferralCode | null> {
    const { data, error } = await this.accountAPI.validateReferralCode(code);

    if (!data) {
      if (error) {
        api_error(error);
      }
      return null;
    }

    return data.referral;
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
