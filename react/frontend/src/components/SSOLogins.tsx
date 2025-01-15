import React from 'react';
import { getCSRFToken } from '../lib/django';
import { useQuery } from '@tanstack/react-query';
import { getSSOConfig } from '../api/auth';
import { SSOProvider } from '../models';
import GoogleIcon from '../shared/Icon/GoogleIcon';
import AppleIcon from '../shared/Icon/AppleIcon';
import TwitterXIcon from '../shared/Icon/TwitterXIcon';
import FacebookIcon from '../shared/Icon/FacebookIcon';


const SSOLogins: React.FC = () => {

  const providersQuery = useQuery({
    queryKey: ["soo-providers"],
    queryFn: () => getSSOConfig()
  });

  const ssoIcons = {
    "google": <GoogleIcon />,
    "apple": <AppleIcon />,
    "twitter": <TwitterXIcon />,
    "facebook": <FacebookIcon />,
  };

  return (
    <div className="">
      {providersQuery.data &&
        providersQuery.data.map((provider: SSOProvider) => {
          return (<form
            key={provider.id}
            action={`/api/auth/social/provider/redirect`}
            method="post"
          >
            <input type="hidden" value={provider.id} name="provider" />
            <input type="hidden" value="login" name="process" />
            <input type="hidden" value={`/account/provider/callback`} name="callback_url" />
            <input type="hidden" value={getCSRFToken()} name="csrfmiddlewaretoken" />
            <button
              className="btn-sso flex items-center"
            >
              <div className="w-6 mr-2">{ssoIcons[provider.id]}</div>
              <div className="mr-2">{provider.name}</div>
            </button>
          </form >
          )
        })
      }
    </div >
  )
}

export default SSOLogins;
