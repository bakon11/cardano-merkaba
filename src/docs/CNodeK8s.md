# Deploying Ogmios and Cardano Node on a Talos Kubernetes Cluster

## Abstract

This document provides a comprehensive guide to deploying the Ogmios and Cardano Node services on a Talos Linux Kubernetes cluster running on Proxmox. It addresses the conversion of the Ogmios `docker-compose.yml` into Kubernetes manifests, resolves a ConfigMap error, and outlines steps for configuration, deployment, and verification. The guide assumes a Talos cluster with one control-plane node (`talos-master`) and two worker nodes (`talos-worker-1`, `talos-worker-2`), and is tailored for prototyping Cardano blockchain applications.

## Table of Contents

- Introduction
- Prerequisites
- Resolving the ConfigMap Error
- Deployment Steps
  - Create the ConfigMap
  - Set Up Persistent Storage
  - Deploy cardano-node and ogmios
  - Expose Ogmios Service
  - Optional: Use MetalLB for LoadBalancer
  - Verify the Deployment
- Troubleshooting
- Prototyping with Ogmios
- Conclusion
- References

## Introduction

This guide details the process of deploying the `cardano-node` and `ogmios` services, as defined in the Ogmios `docker-compose.yml` (GitHub link), on a Talos Linux Kubernetes cluster hosted on Proxmox. Talos Linux is a secure, immutable operating system designed for Kubernetes, and this setup leverages its API-driven management with `talosctl` and `kubectl`. The document addresses a specific error encountered when creating a ConfigMap (`cannot give a key name for a directory path`) and provides Kubernetes manifests to replicate the Docker Compose configuration.

The cluster consists of three virtual machines:

- **talos-master** (192.168.1.42): Control-plane node, managing the Kubernetes API and cluster state.
- **talos-worker-1** (192.168.1.41): Worker node, running containerized workloads.
- **talos-worker-2** (192.168.1.33): Worker node, providing redundancy and scalability.

## Prerequisites

Before proceeding, ensure the following:

- Talos Linux VMs are running on Proxmox with static IPs.
- `talosctl` is installed on your Ubuntu machine:

  ```bash
  curl -Lo /tmp/talosctl https://github.com/siderolabs/talos/releases/download/v1.9.5/talosctl-linux-amd64
  chmod +x /tmp/talosctl
  sudo mv /tmp/talosctl /usr/local/bin/talosctl
  ```
- `kubectl` is installed and configured with the cluster's `kubeconfig`:

  ```bash
  talosctl kubeconfig .
  ```
- The Ogmios repository is cloned with submodules initialized:

  ```bash
  git clone --depth 1 --recursive --shallow-submodules https://github.com/CardanoSolutions/ogmios.git
  cd ogmios
  git submodule update --init --recursive
  ```
- A storage class (e.g., `local-path` or Longhorn) is available for persistent volumes.

## Resolving the ConfigMap Error

The error `cannot give a key name for a directory path` occurred when creating a ConfigMap with the `genesis` directory, which contains multiple files (`alonzo-genesis.json`, `byron-genesis.json`, `shelley-genesis.json`). Kubernetes ConfigMaps require individual files, not directories. The corrected command specifies each genesis file explicitly, resolving the issue.

## Deployment Steps

### Create the ConfigMap

Create a ConfigMap to store configuration files for `cardano-node` and `ogmios`.

```bash
kubectl create configmap cardano-mainnet-config \
  --from-file=config.json=server/config/network/mainnet/cardano-node/config.json \
  --from-file=topology.json=server/config/network/mainnet/cardano-node/topology.json \
  --from-file=alonzo-genesis.json=server/config/network/mainnet/genesis/alonzo-genesis.json \
  --from-file=byron-genesis.json=server/config/network/mainnet/genesis/byron-genesis.json \
  --from-file=shelley-genesis.json=server/config/network/mainnet/genesis/shelley-genesis.json
```

Verify the ConfigMap:

```bash
kubectl describe configmap cardano-mainnet-config
```

**Note**: For non-mainnet networks (e.g., `testnet`), replace `mainnet` with the appropriate network directory (e.g., `server/config/network/testnet`).

### Set Up Persistent Storage

Create PersistentVolumeClaims (PVCs) for the Cardano node database (`node-db`) and shared IPC socket (`node-ipc`).

```bash
cat <<EOF > pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cardano-node-db
  namespace: default
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: local-path
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cardano-node-ipc
  namespace: default
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: local-path
EOF
kubectl apply -f pvc.yaml
```

If using Longhorn for storage, install it:

```bash
helm install longhorn longhorn/longhorn --namespace longhorn-system --create-namespace
```

Update `storageClassName` to `longhorn` in `pvc.yaml` if applicable.

### Deploy cardano-node and ogmios

Create Deployments to run `cardano-node` and `ogmios` pods.

```bash
cat <<EOF > deployments.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cardano-node
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cardano-node
  template:
    metadata:
      labels:
        app: cardano-node
    spec:
      containers:
      - name: cardano-node
        image: ghcr.io/intersectmbo/cardano-node:10.1.4
        command:
        - cardano-node
        - run
        - --config
        - /config/config.json
        - --database-path
        - /data/db
        - --socket-path
        - /ipc/node.socket
        - --topology
        - /config/topology.json
        volumeMounts:
        - name: config
          mountPath: /config
        - name: genesis
          mountPath: /genesis
        - name: node-db
          mountPath: /data
        - name: node-ipc
          mountPath: /ipc
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2"
      volumes:
      - name: config
        configMap:
          name: cardano-mainnet-config
          items:
          - key: config.json
            path: config.json
          - key: topology.json
            path: topology.json
      - name: genesis
        configMap:
          name: cardano-mainnet-config
          items:
          - key: alonzo-genesis.json
            path: alonzo-genesis.json
          - key: byron-genesis.json
            path: byron-genesis.json
          - key: shelley-genesis.json
            path: shelley-genesis.json
      - name: node-db
        persistentVolumeClaim:
          claimName: cardano-node-db
      - name: node-ipc
        persistentVolumeClaim:
          claimName: cardano-node-ipc
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ogmios
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ogmios
  template:
    metadata:
      labels:
        app: ogmios
    spec:
      containers:
      - name: ogmios
        image: cardanosolutions/ogmios:latest
        command:
        - /bin/ogmios
        - --host
        - 0.0.0.0
        - --node-socket
        - /ipc/node.socket
        - --node-config
        - /config/cardano-node/config.json
        ports:
        - containerPort: 1337
        volumeMounts:
        - name: config
          mountPath: /config/cardano-node
        - name: node-ipc
          mountPath: /ipc
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1"
      volumes:
      - name: config
        configMap:
          name: cardano-mainnet-config
          items:
          - key: config.json
            path: config.json
      - name: node-ipc
        persistentVolumeClaim:
          claimName: cardano-node-ipc
EOF
kubectl apply -f deployments.yaml
```

### Expose Ogmios Service

Expose the `ogmios` service on port 1337 using a NodePort.

```bash
cat <<EOF > service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ogmios
  namespace: default
spec:
  selector:
    app: ogmios
  ports:
  - protocol: TCP
    port: 1337
    targetPort: 1337
  type: NodePort
EOF
kubectl apply -f service.yaml
```

Find the NodePort:

```bash
kubectl get svc ogmios
```

Access `ogmios` at `ws://<worker-ip>:<node-port>` (e.g., `ws://192.168.1.41:3xxxx`).

### Optional: Use MetalLB for LoadBalancer

For a stable external IP, install MetalLB and configure a LoadBalancer service.

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.7/config/manifests/metallb-native.yaml
cat <<EOF > metallb-config.yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default
  namespace: metallb-system
spec:
  addresses:
  - 192.168.1.100-192.168.1.150
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: default
  namespace: metallb-system
EOF
kubectl apply -f metallb-config.yaml
```

Update `service.yaml` to use `type: LoadBalancer`:

```bash
cat <<EOF > service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ogmios
  namespace: default
spec:
  selector:
    app: ogmios
  ports:
  - protocol: TCP
    port: 1337
    targetPort: 1337
  type: LoadBalancer
EOF
kubectl apply -f service.yaml
```

Get the LoadBalancer IP:

```bash
kubectl get svc ogmios
```

Access `ogmios` at `ws://<external-ip>:1337` (e.g., `ws://192.168.1.100:1337`).

### Verify the Deployment

Check pod status:

```bash
kubectl get pods
```

Expected output:

```
NAME                           READY   STATUS    RESTARTS   AGE
cardano-node-xxx   1/1     Running   0          5m
ogmios-xxx         1/1     Running   0          5m
```

Check logs for issues:

```bash
kubectl logs -l app=cardano-node
kubectl logs -l app=ogmios
```

Test `ogmios` with a WebSocket client:

```bash
wscat -c ws://<external-ip>:1337
{"jsonrpc":"2.0","method":"getChainTip","id":1}
```

## Troubleshooting

- **Pods not running**: Check logs (`kubectl logs`) or describe pods (`kubectl describe pod`).
- **IPC issues**: Ensure the `node-ipc` PVC is shared correctly between pods.
- **Network issues**: Verify connectivity to `192.168.1.42:6443` and the `ogmios` external IP/port.
- **Node health**: Check Talos node services:

  ```bash
  talosctl --nodes 192.168.1.42 get services
  ```
- **Proxmox snapshots**: Take snapshots of VMs (`talos-master`, `talos-worker-1`, `talos-worker-2`) before applying manifests for easy rollbacks.

## Prototyping with Ogmios

Interact with `ogmios` via its WebSocket API (see Ogmios User Manual). Example:

```bash
wscat -c ws://192.168.1.100:1337
{"jsonrpc":"2.0","method":"getChainTip","id":1}
```

Consider deploying additional tools like Kupo for indexing (Kupo+Ognios example).

## Conclusion

This guide enables the deployment of `cardano-node` and `ogmios` on a Talos Kubernetes cluster, facilitating Cardano blockchain prototyping. The manifests replicate the functionality of the Ogmios `docker-compose.yml`, addressing the ConfigMap error and leveraging Talos’s secure, immutable design.

## References

- Ogmios docker-compose.yml
- Ogmios User Manual
- Talos on Proxmox Guide
- Kubernetes ConfigMaps
- MetalLB Documentation
- Kupo+Ognios Example