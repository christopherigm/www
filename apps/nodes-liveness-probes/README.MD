## Deploy Nginx proxy

Create namespace

```sh
kubectl create namespace liveness
```

```sh
helm install node1 deployment -n liveness \
  --set name=node1-liveness \
  --set ingress.host=node1.liveness.iguzman.com.mx \
  --set deployment.nodeSelector.nodeName=node1 && \
helm install node2 deployment -n liveness \
  --set name=node2-liveness \
  --set ingress.host=node2.liveness.iguzman.com.mx \
  --set deployment.nodeSelector.nodeName=node2 && \
helm install node3 deployment -n liveness \
  --set name=node3-liveness \
  --set ingress.host=node3.liveness.iguzman.com.mx \
  --set deployment.nodeSelector.nodeName=node3 && \
helm install node4 deployment -n liveness \
  --set name=node4-liveness \
  --set ingress.host=node4.liveness.iguzman.com.mx \
  --set deployment.nodeSelector.nodeName=node4 && \
helm install node5 deployment -n liveness \
  --set name=node5-liveness \
  --set ingress.host=node5.liveness.iguzman.com.mx \
  --set deployment.nodeSelector.nodeName=node5
helm install node6 deployment -n liveness \
  --set name=node6-liveness \
  --set ingress.host=node6.liveness.iguzman.com.mx \
  --set deployment.nodeSelector.nodeName=node6

```

Delete deployment

```sh
helm delete node1 -n liveness && \
helm delete node2 -n liveness && \
helm delete node3 -n liveness && \
helm delete node4 -n liveness && \
helm delete node5 -n liveness && \
helm delete node6 -n liveness && \
helm delete raspberrypi-nginx-proxy -n raspberrypi
```

sudo snap remove microk8s && \
sudo snap install microk8s --classic && \
sudo usermod -a -G microk8s christopher && \
sudo chown -f -R christopher ~/.kube && \
newgrp microk8s

Get repo

kubectl create namespace cert-manager && \
helm repo add jetstack https://charts.jetstack.io && \
helm repo update
Install Cert Manager

helm install \
 cert-manager jetstack/cert-manager \
 --namespace cert-manager \
 --create-namespace \
 --version v1.9.1 \
 --set installCRDs=true
Deploy Cluster Issuer

kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
name: letsencrypt-prod
namespace: cert-manager
spec:
acme:
server: https://acme-v02.api.letsencrypt.org/directory
email: christopher.guzman.monsalvo@gmail.com
privateKeySecretRef:
name: letsencrypt-prod
solvers: - http01:
ingress:
class: public
EOF
