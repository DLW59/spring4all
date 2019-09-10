package us.codecraft.tinyioc;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

/**
 * @author dengliwen
 * @date 2019/8/18
 * @desc
 */
public class HelloWorldProxy {

    public static<T> T getProxy(final HelloWord helloWord) {
        return (T) Proxy.newProxyInstance(helloWord.getClass().getClassLoader(), helloWord.getClass().getInterfaces(), new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                System.out.println("执行方法");
                final Object o = method.invoke(helloWord, args);
                System.out.println("执行结束");
                return o;
            }
        });
    }
}
