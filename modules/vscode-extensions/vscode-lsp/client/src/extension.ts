/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 * ------------------------------------------------------------------------------------------ */

/* --------------------------------------------------------------------------------------------
 * Copied from sample of Microsoft corporation,
 * Licensed under the MIT License.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext, WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';
import { IdentityServerDebugSession } from './identityServerDebug';
import * as vscode from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';
let client: LanguageClient;
import * as Net from 'net';
import { FileHandler } from './lspModules/fileHandler';
import { ServiceManger } from './lspModules/serviceManger';
import { PreviewManager } from './lspModules/PreviewManager';
import { ScriptLibraryTree } from './lspModules/scriptLibraryTree';
import { ServiceTree } from './lspModules/serviceTree';
/*
 * Set the following compile time flag to true if the
 * debug adapter should run inside the extension host.
 * Please note: the test suite does not (yet) work in this mode.
 */
const EMBED_DEBUG_ADAPTER = true;
export function activate(context: ExtensionContext) {

	// To keep the file path of the xml of the service provider.
	var xmlFilePath;
	// The Object Of the FileHandler.
	const fileHandler = new FileHandler();
	// The Object Of the previewManager.
	const previewManager = PreviewManager.getInstance();
	// The object of the ServiceManger.
	const serviceManger = new ServiceManger(context);
	// The server is implemented in node
	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents		
		documentSelector: [{ scheme: 'file', language: 'javascript' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	vscode.window.createTreeView('service-providers', {
		treeDataProvider: new ServiceTree(context)
	});

	vscode.window.createTreeView('script-libraries', {
		treeDataProvider: new ScriptLibraryTree(context)
	});
	context.subscriptions.push(

		// Show oAuth webview.
		vscode.commands.registerCommand('extension.oAuth', () => {
			previewManager.generateOAuthPreview(context);
		}),

		// File open event hadler
		vscode.workspace.onDidOpenTextDocument(async (file) => {
			// Get the Extesnion of the file.
			var extensionOfOpenedFile = path.extname(file.uri.fsPath.split(".git")[0]);
			// Check the extension of the opened file.
			console.log(extensionOfOpenedFile);
			if (extensionOfOpenedFile == ".authxml") {
				await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
				xmlFilePath = file.uri.fsPath.split(".git")[0];
				previewManager.generateWebViewPanel(xmlFilePath, context);
			}
		}),

		// Show Diagram command registration.
		vscode.commands.registerCommand('extension.diagram', () => {
			const { activeTextEditor } = vscode.window;
			const { document } = activeTextEditor;
			const filepath = document.uri;
			xmlFilePath = filepath.fsPath;
			previewManager.generateWebViewPanel(xmlFilePath, context);
		}),

		// Sync command registration.
		vscode.commands.registerCommand('extension.script', async () => {
			fileHandler.syncServiceProviderWithAdaptiveScript();
		}),

		// List the service providers in command plate.
		vscode.commands.registerCommand('extension.serviceProviers', async () => {
			//get the service providers list in command pallete.			
			serviceManger.getServicesList();
			// xmlFilePath = serviceProvidersDirectory + result + '.authxml';
			// previewManager.generateWebViewPanel(xmlFilePath, context);

		}),

		// List the service providers in command plate.
		vscode.commands.registerCommand('extension.serviceProvierFromTreeView', async (servicesArray, serviceName) => {
			//get the service providers list in command pallete.					
			serviceManger.getIDOfService(servicesArray, serviceName);
		}),

		// List the script libraries in command plate.
		vscode.commands.registerCommand('extension.scriptLibrariesFromTreeView', async (scriptLibraryName) => {
			//get the script libraries list in command pallete.					
			console.log(scriptLibraryName);
		}),

		// Refresh the script libraries list.
		vscode.commands.registerCommand('extension.refreshScripts', () => {
			vscode.window.createTreeView('script-libraries', {
				treeDataProvider: new ScriptLibraryTree(context)
			});
		}),

		// Refresh the service providers list.
		vscode.commands.registerCommand('extension.refreshServices', () => {
			vscode.window.createTreeView('service-providers', {
				treeDataProvider: new ServiceTree(context)
			});
		})
	);
	// register a configuration provider for 'mock' debug type
	const provider = new MockConfigurationProvider();
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('mock', provider));
	console.log("EMBED_DEBUG_ADAPTER " + EMBED_DEBUG_ADAPTER);
	if (EMBED_DEBUG_ADAPTER) {
		// The following use of a DebugAdapter factory shows how to run the debug adapter inside the extension host (and not as a separate process).
		const factory = new IdentityServerDebugAdapterDescriptorFactory();
		context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('mock', factory));
		context.subscriptions.push(factory);
	} else {
		// The following use of a DebugAdapter factory shows how to control what debug adapter executable is used.
		// Since the code implements the default behavior, it is absolutely not neccessary and we show it here only for educational purpose.
		context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('mock', {
			createDebugAdapterDescriptor: (session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined) => {
				// param "executable" contains the executable optionally specified in the package.json (if any)

				// use the executable specified in the package.json if it exists or determine it based on some other information (e.g. the session)
				if (!executable) {
					const command = "absolute path to my DA executable";
					const args = [
						"some args",
						"another arg"
					];
					const options = {
						cwd: "working directory for executable",
						env: { "VAR": "some value" }
					};
					executable = new vscode.DebugAdapterExecutable(command, args, options);
				}

				// make VS Code launch the DA executable
				return executable;
			}
		}));
	}

	// Create the language client and start the client.
	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}



class MockConfigurationProvider implements vscode.DebugConfigurationProvider {

	/**
	 * Massage a debug configuration just before a debug session is being launched,
	 * e.g. add all missing attributes to the debug configuration.
	 */
	resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

		// if launch.json is missing or empty
		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;

			if (editor && editor.document.languageId === 'javascript') {
				config.type = 'mock';
				config.name = 'Launch';
				config.request = 'launch';
				config.program = '${file}';
				config.outFiles = '${file}.out';
				config.stopOnEntry = true;
			}
		}

		if (!config.program) {
			//return config;
			return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
				return undefined;	// abort launch
			});
		}

		return config;
	}
}

class IdentityServerDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {

	private server?: Net.Server;

	createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {

		if (!this.server) {
			// start listening on a random port
			this.server = Net.createServer(socket => {
				const session = new IdentityServerDebugSession();
				session.setRunAsServer(true);
				session.start(<NodeJS.ReadableStream>socket, socket);
			}).listen(0);
		}

		// make VS Code connect to debug server
		return new vscode.DebugAdapterServer((<Net.AddressInfo>this.server.address()).port);
	}

	dispose() {
		if (this.server) {
			this.server.close();
		}
	}
}
