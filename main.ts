import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';
import { DeboredApp, IngressType } from 'cdk8s-debore'; 
import { Pod, Deployment, PodSpec } from './imports/k8s';

class MyChart extends Chart {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const podSpec: PodSpec = {
      containers: [
        {
          name: 'hello',
          image: 'stefanprodan/podinfo',
          ports: [
            { containerPort: 9898 }
          ]
        }
      ]
    };

    // define resources here

    // L1 Pod Construct
    new Pod(this, 'pod', {
      spec: podSpec
    });

    // L1 Deployment Construct
    const label = { app: 'podinfo' };
    new Deployment(this, 'deployment', {
      spec: {
        selector: {
          matchLabels: label,
        },
        replicas: 3,
        template: {
          metadata: {
            labels: label
          },
          spec: podSpec
        }
      }
    });

    // L2 Construct lib from `cdk8s-debore`
    new DeboredApp(this, 'podinfo', {
      image: 'stefanprodan/podinfo',
      containerPort: 9898,
      defaultReplicas: 5,
      ingress: IngressType.CLUSTER_IP,
      autoScale: true
    });
  }
}

const app = new App();
new MyChart(app, 'cdk8s-playground');
app.synth();