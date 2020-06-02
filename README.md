# identity-tools-debugger
Tools which helps to communicate with the extension and add functionality intercept with the Identity server 
It has  two components 
1. Debugger sever - helps to interact with VSCode Extension.
2. Java Agent - helps to intercept with the IS server.

# How to add debug support to IS

* Modify the startup script to enable agent "wso2server.sh"
  * please change `<VERSION>` to the version used in the IS.

```
-javaagent:$CARBON_HOME/lib/org.wso2.carbon.identity.developer.java-agent-<VERSION>-jar-with-dependencies.jar \
```
* Start the server
* Play with VS-Code extensions

