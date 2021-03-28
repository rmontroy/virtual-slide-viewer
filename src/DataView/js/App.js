import { useEffect, useState } from 'react';
import { html } from 'htm/react';
import GovernmentSystemBanner from './GovernmentSystemBanner';
import ResearchOnlyBanner from './ResearchOnlyBanner';
import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import DataView from './DataView';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Amplify, Auth, Hub } from 'aws-amplify';
import awsconfig from '/aws-exports';

Amplify.configure(awsconfig);          

const httpLink = new HttpLink({
  uri: awsconfig.aws_appsync_graphqlEndpoint
});

const cache = new InMemoryCache({
  typePolicies: {
    Slide: {
      keyFields: ["ImageID"]
    },
    Query: {
      fields: {
        querySlidesByStatus: {
          keyArgs: ["Status"],
          merge(existing, incoming, { readField }) {
            let items = existing ? { ...existing.items } : {};
            incoming.items.forEach(item => {
              items[readField("ImageID", item)] = item;
            });
            return {
              nextToken: incoming.nextToken,
              items,
            };
          },
          read(existing) {
            if (existing) {
              return {
                nextToken: existing.nextToken,
                items: Object.values(existing.items)
              };
            }
          }
        }
      }
    }
  }
});

function App() {
  const [jwt, setJwt] = useState(null);
  const [client, setClient] = useState(null);
  useEffect(() => {
    if (!jwt) return;

    const authLink = setContext((_, { headers }) => {
      // return the headers to the context so httpLink can read them    
      return {
        headers: {
          ...headers,
          authorization: jwt,
        }
      }
    });
      
    const client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache
    });
    setClient(client);
  }, [jwt]);

  // Nasty workaround take from here: https://docs.amplify.aws/lib/auth/social/q/platform/js#full-samples
  useEffect(() => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          Auth.currentSession().then(session => {
            setJwt(session.getAccessToken().getJwtToken());
          });
          break;
        case 'signOut':
          setJwt(false);
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data);
          break;
      }
    });
  }, []);

  useEffect(() => {
    if (!jwt) {
      var urlParams = new URLSearchParams(location.search);
      if (!urlParams.has('code')) {
        Auth.currentSession().then(session => {
          let token = session.getAccessToken().getJwtToken();
          if (token) {
            setJwt(token);
          } else {
            Auth.federatedSignIn();
          }
        });
      }
    }
  }, [jwt]);
  
  return html`
    <div>
      <${GovernmentSystemBanner} />
      <${ResearchOnlyBanner} />

      ${jwt && client ? html`
        <${ApolloProvider} client=${client}>
          <${DataView} />
        </${ApolloProvider}>
      ` : html`<${CircularProgress} />`}
    </div>
  `;
}

export default App;