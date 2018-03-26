---
layout:     post
title:      "PV method in Java"
subtitle:   "解开你所有锁上的锁，把心偷偷偷出来"
date:       2018-03-26 19:00:00
author:     "xu"
header-img: "img/in-post/post-how-2-computernetworking/head.jpg"
header-mask: 0.3
catalog:    true
tags:
    - Java
    - Operating System
---


> 写一个用object的wait（）方法和notify（）方法来解决消费者和生产者问题

实质是使用了线程锁，PV操作了解一下？
```Java
import java.util.LinkedList;

public class ConsumerAndProvider {
    public static void main(String[] args) {
        Basket basket=new Basket();
        Productor productor=new Productor(basket);
        Consumer consumer=new Consumer(basket);
        productor.start();
        consumer.start();
    }
}


//产品
class Apple{
    private int id;
    public Apple(int id){
        this.id=id;
    }

    @Override
    public String toString() {
        return "苹果"+(id+1);
    }
}
//producer，访问共同区域的线程之生产者
class Productor extends Thread{
    private Basket basket=null;
    public Productor(Basket basket) {
        this.basket = basket;
    }

    @Override
    public void run() {
        basket.pushApple();
    }
}
//consumer，访问共同区域的线程之消费者
class Consumer extends Thread{
    private Basket basket=null;
    public Consumer(Basket basket) {
        this.basket = basket;
    }

    @Override
    public void run() {
        basket.popApple();
    }
}

//这就是篮子，生产者和消费者共同访问的地方，就是需要控制的地方,正所谓临界资源
class Basket{
    private LinkedList<Apple> basket=new LinkedList<Apple>();


    //封装复杂方法之:放4轮苹果
    public synchronized void pushApple(){ //使用synchronized来修饰，同步方法，获得当前对象的锁，即对篮子上锁
        // 每次只有一个线程能进入篮子
        // 就是一个自动的设置锁的方法，因为每次只能由一个线程进入篮子
        for (int i=0;i<20;i++) {
            Apple apple=new Apple(i);
            push(apple);
        }
    }
    //取4轮苹果
    public synchronized void popApple(){
        for (int i=0;i<20;i++) {
            Apple apple=new Apple(i);
            pop(apple);
        }
    }



    public void push(Apple apple){
        if (basket.size()==5){
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }//等待并释放对于当前对象的锁，就是basket的锁，相当于V操作~，释放了信号量
        }
        try {
            Thread.sleep(500);//调用该方法的线程放完之后就立刻sleep了，过了500毫秒后会自动苏醒，这是一个模拟时间差的步骤
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        basket.addFirst(apple);
        System.out.println("存放："+apple.toString());
        notify();//通知在排队想操作篮子的生产者进入一次准备态，但是若消费者还在吃，没有执行wait方法，那么生产者还是无法打开
        //也就是说仅仅只有消费者wait（）了，生产者也被notify（）了，线程才能交替
        //生产者才能取锁，开始操作篮子这个对象
    }
    public void pop(Apple apple){
        //当篮子中苹果数为0时，通知
        if (basket.size()==0){
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }//等待并释放当前blaket对象的锁，相当于V操作~，释放了信号量，使得等待中的productor来进入对篮子的操作
        }
        try {
            Thread.sleep(500);//放完之后就立刻sleep了，过了500毫秒后会自动苏醒，这是一个模拟时间差的步骤
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("吃掉："+apple.toString());
        basket.removeFirst();
        notify();//通知下一个循环的消费者来吃苹果
    }

}


```
接下来是运行结果
![](/img/in-post/Thread-and-PV/java-thread-1.JPG )
![](/img/in-post/Thread-and-PV/java-thread-2.JPG )