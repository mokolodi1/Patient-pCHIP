#!/usr/bin/env	RScript


m = read.table('test.results.tab', header=T)

f = m[which(m[,2] == 'false'),3]
t = m[which(m[,2] == 'true'),3]

summary(f)
summary(t)

ks.test(t,f)

png("density.png")
plot(density(t), col="red", lwd=2)
lines(density(f), col="blue", lwd=2)
q();
