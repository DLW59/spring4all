tiny-spring
=======

>A tiny IoC container refer to Spring.

## 关于

`tiny-spring`是为了学习Spring的而开发的，可以认为是一个Spring的精简版。Spring的代码很多，层次复杂，阅读起来费劲。我尝试从使用功能的角度出发，参考Spring的实现，一步一步构建，最终完成一个精简版的Spring。有人把程序员与画家做比较，画家有门基本功叫临摹，tiny-spring可以算是一个程序的临摹版本-从自己的需求出发，进行程序设计，同时对著名项目进行参考。

## 功能

1. 支持singleton类型的bean，包括初始化、属性注入、以及依赖bean注入。
2. 可从xml中读取配置。
3. 可以使用Aspectj的方式进行AOP编写，支持接口和类代理。

## 使用

`tiny-spring`是逐步进行构建的，里程碑版本我都使用了git tag来管理。例如，最开始的tag是`step-1-container-register-and-get`，那么可以使用

	git checkout step-1-container-register-and-get
	
来获得这一版本。版本历史见[`changelog.md`](https://github.com/code4craft/tiny-spring/blob/master/changelog.md)。