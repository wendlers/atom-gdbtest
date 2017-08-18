'use babel';

import fs from 'fs';
import path from 'path';

import getCurrentProjectDir from './gdbtest-util';


export default class GdbtestSettings {

    constructor() {

      this.target = 'test.elf';
      this.server = 'gdbserver';
      this.serverArgs = [':4444'];
      this.client = 'gdb';
      this.clientArgs = [];
      this.initCommands = ['target remote :4444'];
    }

    getSettingsFileName() {

      var p = getCurrentProjectDir();

      if(p) {
          return path.join(p, "gdbtest_settings.json");
      }

      return null;
    }

    read() {

      var fname = this.getSettingsFileName();

      if(fname && fs.existsSync(fname)) {

        console.log('reading settings from: ' + fname);

        var json = JSON.parse(fs.readFileSync(fname));

        this.target = json.target;
        this.server = json.server;
        this.serverArgs = json.serverArgs;
        this.client = json.client;
        this.clientArgs = json.clientArgs;
        this.initCommands = json.initCommands;
      }
    }

    write() {

        var fname = this.getSettingsFileName();

        if(fname) {
          console.log('writing settings to: ' + fname);
          fs.writeFileSync(fname, JSON.stringify(this));
        }
        else {
          /* this is OK since it only menas that there is no active project */
          console.log('failed to save settings for gdbtest (no active project?)');
        }
    }

    dump() {

        console.log(
            ';target=' + this.target +
            ';server' + this.server +
            ';serverArgs' + this.serverArgs +
            ';client' + this.client +
            ';clientArgs' + this.clientArgs +
            ';initCommands' + this.initCommands
        );
    }
}
