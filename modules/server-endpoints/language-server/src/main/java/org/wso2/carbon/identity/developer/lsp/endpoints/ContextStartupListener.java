/*
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
 */

package org.wso2.carbon.identity.developer.lsp.endpoints;

import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.identity.application.authentication.framework.JsFunctionRegistry;
import org.wso2.carbon.identity.developer.lsp.LanguageProcessorFactory;
import org.wso2.carbon.identity.developer.lsp.ServiceReferenceHolder;
import org.wso2.carbon.identity.developer.lsp.debug.runtime.DebugSessionManager;
import org.wso2.carbon.identity.developer.lsp.debug.runtime.DebugSessionManagerImpl;
import org.wso2.carbon.identity.developer.lsp.language.sp.AuthenticationScriptProcessor;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

/**
 * Sets up the required services to the endpoint.
 */
@WebListener
public class ContextStartupListener implements ServletContextListener {

    private LanguageProcessorFactory languageProcessorFactory;
    private DebugSessionManagerImpl debugSessionManager;

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {

        bindRequiredServices(JsFunctionRegistry.class);

        AuthenticationScriptProcessor authenticationScriptProcessor = new AuthenticationScriptProcessor();
        authenticationScriptProcessor.setJsFunctionRegistry(
                ServiceReferenceHolder.getInstance().getService(JsFunctionRegistry.class));
        this.languageProcessorFactory = new LanguageProcessorFactory();
        languageProcessorFactory.addProcessor("Application", authenticationScriptProcessor);

        ServiceReferenceHolder.getInstance().addService(LanguageProcessorFactory.class, languageProcessorFactory);
        debugSessionManager = new DebugSessionManagerImpl();
        debugSessionManager.init();
        ServiceReferenceHolder.getInstance().addService(DebugSessionManager.class, debugSessionManager);
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        debugSessionManager.destroy();
    }

    private void bindRequiredServices(Class... types) {

        if (types == null) {
            return;
        }
        for (Class type : types) {
            Object service = PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(type, null);

            if (service != null) {
                ServiceReferenceHolder.getInstance().addService(type, service);
            }
        }
    }
}
