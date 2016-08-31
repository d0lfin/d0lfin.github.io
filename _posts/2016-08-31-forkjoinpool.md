---
layout: post
title: Принцип использования ForkJoinPool в Java
tags: [java]
---
ForkJoinPool был представлен в Java 7. Основной особенностью данного класса является выполнение рекурсивных задач. 
ForkJoinPool берет большую задачу и разбивает ее на маленькие подзадачи, которые, в свою очередь, разбиваются на 
еще более мелкие, пока это возможно.

![](/img/2808176-image1.jpeg)

![](/img/2808182-image2.jpeg)

Пример реализации бинарного поиска:

```(java)
package com.example.concurrency;
import java.util.Arrays;
import java.util.concurrent.RecursiveTask;
public class ForkJoinSearcher extends RecursiveTask<Boolean>{
       int[] arr;
       int searchableElement;
       ForkJoinSearcher(int[] arr,int search)
       {
              this.arr = arr;
              this.searchableElement=search;
       }
       @Override
       protected Boolean compute() {      
              int mid=( 0 + arr.length)/2;
              System.out.println(Thread.currentThread().getName() + 
              " says : After splliting the arry length is :: "+ arr.length + " Midpoint is " + mid);
              if (arr[mid]=searchableElement)
              {
                     System.out.println(" FOUND !!!!!!!!!");
                     return true;
              }
              else if(mid=1 || mid == arr.length)
              {
                     System.out.println("NOT FOUND !!!!!!!!!");
                     returnfalse;
              }
              else if(searchableElement < arr[mid])
              {
                     System.out.println(Thread.currentThread().getName() + " says :: Doing Left-search");
                     int[] left = Arrays.copyOfRange(arr, 0, mid);
                     ForkJoinSearcher forkTask = new ForkJoinSearcher(left,searchableElement);
                     forkTask.fork();
                     return forkTask.join();
              }
              else if(searchableElement > arr[mid])
              {
                     System.out.println(Thread.currentThread().getName() + " says :: Doing Right-search");
                     int[] right = Arrays.copyOfRange(arr, mid, arr.length);
                     ForkJoinSearcher forkTask = new ForkJoinSearcher(right,searchableElement);
                     forkTask.fork();
                     return forkTask.join();
              }            
              return false;             
       }
}
package com.example.concurrency;
import java.util.Arrays;
import java.util.concurrent.ForkJoinPool;
public class BinarySearch {
       int[] arr = newint[100];
       public BinarySearch()
           {
              init();
           }
       private void init()
       {
              for(int ; i<arr.length;i++)
              {
                     arr[i];
              }             
              Arrays.sort(arr);
       }      
       public void createForJoinPool(int search)
       {
              ForkJoinPool forkJoinPool = new ForkJoinPool(50);
              ForkJoinSearcher searcher = new ForkJoinSearcher(this.arr,search);
              Boolean status = forkJoinPool.invoke(searcher);             
              System.out.println(" Element ::" + search +" has been found in array? :: " + status );             
       }
       public static void main(String[] args) {
              BinarySearch search = new BinarySearch();
              search.createForJoinPool(10);
              System.out.println("**********************");
              search.createForJoinPool(104);             
       }
}
```

[Источник](https://dzone.com/articles/java-concurrency-fork-join-pool).