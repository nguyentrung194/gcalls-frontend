// import JsSIP from 'jssip';

// const socket = new JsSIP.WebSocketInterface('wss://sbc03.tel4vn.com:7444');

const local = {
  api: 'http://localhost:8080',
  user1: '108@2-test1.gcalls.vn:50061',
  user2: '109@2-test1.gcalls.vn:50061',
};

const staging = {
  api: '',
  user1: '108@2-test1.gcalls.vn:50061',
  user2: '109@2-test1.gcalls.vn:50061',
};

const prod = {
  api: '',
  user1: '108@2-test1.gcalls.vn:50061',
  user2: '109@2-test1.gcalls.vn:50061',
};

let envConfig = local;

if (process.env.REACT_APP_STAGE === 'staging') {
  envConfig = staging;
} else if (process.env.REACT_APP_STAGE === 'prod') {
  envConfig = prod;
} else {
  envConfig = local;
}

const environment = envConfig;

export default environment;
