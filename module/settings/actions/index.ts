"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { success } from "zod";
import { deleteWebhook } from "@/module/github/lib/github";

export type ConnectedRepository = {
  id: string;
  name: string;
  owner: string;
  fullname: string;
  url: string;
  githubId: bigint;
  createdAt: Date;
};

export async function getUserProfile() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.log("[GET_USER_PROFILE_ERROR]", error);
    throw error;
  }
}

export async function updateUserProfile(data: {
  name?: string;
  email?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const updateUser = await prisma.user.update({
        where: {
            id: session.user.id,
        },
        data: {
            name: data.name,
            email: data.email
        },
        select: {
            id: true,
            name: true,
            email: true,
        }
    })

    revalidatePath("/dashboard/settings", "page");

    return{
        success: true,
        user: updateUser
    };
  } catch (error) {
    console.log("[UPDATE_USER_PROFILE_ERROR]", error);
    throw error;
  }
}

export async function getConnectedRepositiories(): Promise<ConnectedRepository[]>{
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if(!session){
      throw new Error("Unauthorized")
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        owner: true,
        fullname: true,
        url: true,
        githubId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return repositories
  } catch (error) {
    console.log("[GET_CONNECTED_REPOSITORIES_ERROR]", error)
    throw error
  }
}

export async function disconnectRepository(repositoryId:string){
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if(!session){
      throw new Error("Unauthorized")
    }

    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId,
        userId: session.user.id
      }
    })

    if(!repository){
      throw new Error("Repository not found")
    }

    await deleteWebhook(repository.owner, repository.name)

    await prisma.repository.delete({
      where: {
        id: repositoryId,
        userId: session.user.id
      }
    })

    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/dashboard/repository", "page");

    return {
      success: true
    }

  } catch (error) {
    console.log("[DISCONNECT_REPOSITORIES_ERROR]", error)
    return {success:false, error: "Failed to disconnect repository"}
  }
}

export async function disconnectAllRepositories(){
  try {

    const session = await auth.api.getSession({
      headers: await headers()
    })

    if(!session?.user){
      throw new Error("Unauthorized")
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id
      }
    })

    if(!repositories){
      throw new Error("Repository not found")
    }

    await Promise.all(repositories.map(async (repo) => {
      await deleteWebhook(repo.owner, repo.name)
    }))

    await prisma.repository.deleteMany({
      where: {
        userId: session.user.id
      }
    })

    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/dashboard/repository", "page");
    
  } catch (error) {

    console.log("[DISCONNECT_ALL_REPOSITORIES_ERROR]", error)
    return {success:false, error: "Failed to disconnect repository"}
    
  }
}
