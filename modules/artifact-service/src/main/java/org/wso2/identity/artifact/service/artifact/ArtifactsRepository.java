/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.wso2.identity.artifact.service.artifact;

import org.wso2.identity.artifact.service.artifact.builder.ArtifactBuilder;
import org.wso2.identity.artifact.service.model.ArtifactRequestData;
import org.wso2.identity.artifact.service.exception.BuilderException;
import org.wso2.identity.artifact.service.exception.ClientException;

import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Set;
import javax.servlet.ServletContext;

public class ArtifactsRepository {

    private static ArtifactsRepository instance;
    private static String rootPath;

    private ArtifactsRepository(ServletContext servletContext) {

        rootPath = Paths.get(servletContext.getRealPath("/"), "WEB-INF", "classes").toString();
    }

    public static ArtifactsRepository getInstance(ServletContext servletContext) {

        if (instance == null) {
            instance = new ArtifactsRepository(servletContext);
        }
        return instance;
    }

    public Artifact findArtifact(String name, ArtifactRequestData artifactRequestData) throws BuilderException, ClientException {

        ArtifactBuilder artifactBuilder = ArtifactRegistry.getBuilder(name, rootPath);
        artifactBuilder.setArtifactRequestData(artifactRequestData);
        return artifactBuilder.build();
    }

    public Set<String> getArtifactNames() {

        return new HashSet<String>() {{
            add("spring-boot");
        }};
    }
}
