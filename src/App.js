import logo from './logo.svg';
import './App.css';
// import {Authentication} from "./components/Authentication";
// import { CapacityCredits } from './components/CapacityCredits';
import { EncryptAuthSig } from './components/EncryptAuthSig';
// import { SocialLogin } from './components/SocialLogin';
// import { MintPkp } from './components/MintPkp';
// import { MintPkpContract } from './components/MintPkpContract';
// import { DiscordAuth } from './components/DiscordAuth';
// import { AuthContext } from './components/AuthContext';
// import {Sample} from './components/Sample';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      {/* <Authentication/> */}
      {/* <CapacityCredits/> */}
      <EncryptAuthSig/>
      {/* <SocialLogin/> */}
      {/* <MintPkp/> */}
      {/* <MintPkpContract/> */}
      {/* <DiscordAuth/> */}
      {/* <AuthContext></AuthContext> */}
      {/* <Sample/> */}
      </header>
    </div>
  );
}

export default App;
