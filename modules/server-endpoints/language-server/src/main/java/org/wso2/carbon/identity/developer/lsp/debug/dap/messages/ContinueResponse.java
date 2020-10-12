/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

package org.wso2.carbon.identity.developer.lsp.debug.dap.messages;

/**
 * JSON Debug ContinueResponse.
 * Response to ‘continue’ request.
 */
public class ContinueResponse extends Response {

    /**
     * If all ThreadsContinued true.
     * If this attribute is missing a value of 'true' is assumed for backward compatibility.
     */
    private Boolean allThreadsContinued;

    public ContinueResponse(String type, long seq, long requestSeq, boolean success, String command,
                            String message, Argument body) {

        super(type, seq, requestSeq, success, command, message, body);
    }

    /**
     * Gets whether allThreadsContinued.
     *
     * @return Whether allThreadsContinued
     */
    public Boolean getAllThreadsContinued() {

        return allThreadsContinued;
    }

    /**
     * Sets whether allThreadsContinued.
     *
     * @param allThreadsContinued If 'allThreadsContinued' is true, a debug adapter can announce that all threads
     *                            have continued.
     */
    public void setAllThreadsContinued(Boolean allThreadsContinued) {

        this.allThreadsContinued = allThreadsContinued;
    }

}
