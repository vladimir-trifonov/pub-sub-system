# Publish-Subscribe System

## Introduction

Implements publish-subscribe model. Has three types of services:

### Broker

Accepts connections from publishers and clients. Also provide routing all messages. 
After new client's connection the broker sends all messages from the last 30 minutes.

### Client

Listens for messages from subscribed topics. Prints all messages to console.

### Publisher

Sends new messages to broker.

## Sample

Starting a central server on port 3001:

```
node ps-broker 3001
```

Starting a publisher, which connects to central server on port 3001 and we are sending a message with topic cars:

```
node ps-publisher 3001
> cars the new BMW rocks!
```

Starting a client, which connects to central server on port 3001 and listens for new messages 
on these topics: money, cars, girls. We are receiving the first message.

```
node ps-client 3001 money cars girls
 [cars] the new BMW rocks!
```