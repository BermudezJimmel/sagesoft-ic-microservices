The `AWS CLI` use to connect and work on your **AWS** using your terminal.

# AWS Configure
To connect on your AWS account/IAM User you need the `Access key ID` and `Secret Access Key` you can get this on your AWS Console under IAM Service. After getting the `Access key ID` and `Secret Access Key` run the following command on your terminal.

```shell

aws configure

```

After running the command you need to enter your `Access Key ID`, `Secret Access Key` and `Region`.
```shell

aws configure
AWS Access Key ID [****************N7WD]: 
AWS Secret Access Key [****************hHrp]: 
Default region name [ap-southeast-1]: 
Default output format [None]:

```

After the configuration you can check your connection using the command below:

```shell

aws sts get-caller-identity

```

```shell

aws sts get-caller-identity

{
    "UserId": "...CX",
    "Account": "38",
    "Arn": "arn:aws:iam::795189341938:user/IC-Jericho"
}

```

