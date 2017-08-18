'use babel';

import GdbtestSettings from './gdbtest-settings';

import { BufferedProcess } from 'atom';
import { CompositeDisposable } from 'atom';
import { Disposable } from 'atom';

import getCurrentProjectDir from './gdbtest-util';

gdbserver_proc = null;


export default {

  subscriptions: null,
  debugger: null,
  settings: null,

  activate(state) {

    this.settings = new GdbtestSettings();
    // this.settings.write();

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'gdbtest:debug': () => this.debug()
    }));
  },

  consumeDebugger(service)
  {
    this.debugger = service;

    return new Disposable(() => {
      this.debugger = null;
    });

    },
  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
      gdbtestViewState: this.gdbtestView.serialize()
    };
  },

  debug() {
    this.settings.read();
    this.settings.dump();

    this.endRemoteDebug();
    this.startRemoteDebug();
  },

  startServer(command, args) {

    console.log(command + ": " + args);

    if(gdbserver_proc != null) {
      gdbserver_proc.kill();
      gdbserver_proc = null;
    }

    const stdout = (output) => notify(output);

    gdbserver_proc = new BufferedProcess({
        command: command,
        args: args,
        exit: (code) => {
          gdbserver_proc = null;
          console.log(command + ' exited with code ' + code);
        }
    });

    gdbserver_proc.onWillThrowError((err) => {
      err.handle();

      gdbserver_proc = null;

      if(err.error.message.endsWith('ENOENT')) {
        atom.notifications.addError(command + ' binary not found');
      }
      else {
        atom.notifications.addError(err.error.message);
      }
    });
  },

  stopServer() {
    if(gdbserver_proc != null) {
        gdbserver_proc.kill();
    }
  },

  startRemoteDebug() {

    // config.evn
    // config.projectDir
    // config.clientArgs
    // config.clientExecutable
    // config.path

    var pd = getCurrentProjectDir();

    if(!pd) {
      atom.notifications.addError('There needs to be an active project to start a GDB session!');
      return;
    }

    this.startServer(this.settings.server, this.settings.serverArgs.concat(this.settings.target));

    if(!gdbserver_proc) {
      atom.notifications.addError('server process not running!');
      return;
    }

    var config = {
      env: process.env,
      projectDir: pd,
      clientExecutable: this.settings.client,
      clientArgs: this.settings.clientArgs,
      initCommands: this.settings.initCommands,
      path: this.settings.target
    };

    this.debugger.debug(config);
  },

  endRemoteDebug() {
    this.debugger.stop();
    this.stopServer();
  }
};
