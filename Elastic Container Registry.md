Amazon Elastic Container Registry (ECR) is a fully managed Docker Container registry provided by `AWS`. It allows you to store, manage, and deploy container images securely. You can use it with `AWS` services like **ECS (Elastic Container Service)**, **EKS (Elastic Kubernetes Service)**, and **Lambda**.

# Create an ECR Repository
The repository will hold our Docker Image that we are going to push later on. To create the repository from you CLI run the command below:

```shell
aws ecr create-repository --repository-name [your-respository-name]
```

# Log in to ECR
To able to push Docker image on your `ECR` repository you need to login first.

```shell
aws ecr get-login-password --region [your-region] | docker login --username AWS --password-stdin [aws-account-id].dkr.ecr.[your-region].amazonaws.com
```

After running this command it should return `Login succeed`.

# Tag the Docker image for ECR
You need to tag your local Docker image to push it on your `ECR` repository.

```shell
docker tag [local-docker-image-name]:latest [aws_account_id].dkr.ecr.[your-region].amazonaws.com/[ecr-name]:latest
```

>[!Tip]
>You can run the following command to check if the image is tagged.
>`docker images`

# Push the Docker image to ECR
When we successfully tagged our docker image we can now proceed to push it on ECR

```shell
docker push [aws_account_id].dkr.ecr.[your_region].amazonaws.com/[ecr-name]:latest
```

After that you can check your AWS Console if the image is reflected or pushed or you can run the following command on your CLI.

```shell
aws ecr list-images --repository-name [ecr-repo-name] --region [your-region]
```




