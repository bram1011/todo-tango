-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" VARCHAR NOT NULL,
    "provider" VARCHAR NOT NULL,
    "providerAccountId" VARCHAR NOT NULL,
    "refresh_token" VARCHAR,
    "access_token" VARCHAR,
    "expires_at" BIGINT,
    "token_type" VARCHAR,
    "scope" VARCHAR,
    "id_token" VARCHAR,
    "session_state" VARCHAR,
    "oauth_token_secret" VARCHAR,
    "oauth_token" VARCHAR,

    CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionToken" VARCHAR NOT NULL,
    "userId" UUID NOT NULL,
    "expires" VARCHAR NOT NULL,

    CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "todoListId" UUID,

    CONSTRAINT "PK_d429b7114371f6a35c5cb4776a7" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_list" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,

    CONSTRAINT "PK_1a5448d48035763b9dbab86555b" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_list_users_users" (
    "todoListId" UUID NOT NULL,
    "usersId" UUID NOT NULL,

    CONSTRAINT "PK_e032e2d0b0c0478a35bfe601bf2" PRIMARY KEY ("todoListId","usersId")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR,
    "email" VARCHAR,
    "emailVerified" VARCHAR,
    "image" VARCHAR,

    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" VARCHAR NOT NULL,
    "identifier" VARCHAR NOT NULL,
    "expires" VARCHAR NOT NULL,

    CONSTRAINT "PK_f2d4d7a2aa57ef199e61567db22" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UQ_8b5e2ec52e335c0fe16d7ec3584" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "IDX_1a3ef362fffe59e00ffe19120b" ON "todo_list_users_users"("todoListId");

-- CreateIndex
CREATE INDEX "IDX_d6c99ab418fad19244a6c61ce6" ON "todo_list_users_users"("usersId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_97672ac88f789774dd47f7c8be3" ON "users"("email");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "FK_d2b734249ae64a7c7468d1d104c" FOREIGN KEY ("todoListId") REFERENCES "todo_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todo_list_users_users" ADD CONSTRAINT "FK_1a3ef362fffe59e00ffe19120b7" FOREIGN KEY ("todoListId") REFERENCES "todo_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_list_users_users" ADD CONSTRAINT "FK_d6c99ab418fad19244a6c61ce64" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
