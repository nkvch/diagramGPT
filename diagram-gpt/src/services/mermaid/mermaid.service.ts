import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as tmp from 'tmp';

@Injectable()
export class MermaidService {
  async generateDiagramAsPNG(mermaidConfig: string): Promise<Buffer> {
    // Use the tmp package to create temporary files
    const configWithNewlines = mermaidConfig.replace(/\r\n|\r|\n/g, '\n');

    const tempInputFile = tmp.fileSync({ postfix: '.mmd' });
    const tempOutputFile = tmp.fileSync({ postfix: '.png' });

    try {
      // Write the Mermaid config to the temporary input file
      fs.writeFileSync(tempInputFile.name, configWithNewlines);
      fs.writeFileSync('mermaidConfig123.mmd', configWithNewlines);

      // read and print the file
      const data = fs.readFileSync(tempInputFile.name, 'utf8');
      console.log('data:', data);

      // Generate the diagram to a temporary output file
      const command = `mmdc -i mermaidConfig123.mmd -o dupa12.png -b transparent`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${command}`, error);
          return;
        }
        console.log('stdout:', stdout);
        console.error('stderr:', stderr);
      }
      );

      // Read the generated PNG file into memory
      const pngData = fs.readFileSync(tempOutputFile.name);

      // Return the PNG data
      return pngData;
    } catch (error) {
      console.error('Error generating Mermaid diagram:', error);
      throw new Error('Failed to generate diagram');
    } finally {
      // Clean up: Close and delete the temporary files
      tempInputFile.removeCallback();
      tempOutputFile.removeCallback();
    }
  }
}
