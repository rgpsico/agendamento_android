module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "https://agendamento.rjpasseios.com.br",
        changeOrigin: true,
        secure: true,
        onProxyRes(proxyRes) {
          const location = proxyRes.headers.location;
          if (location && location.startsWith("https://agendamento.rjpasseios.com.br")) {
            proxyRes.headers.location = location.replace(
              "https://agendamento.rjpasseios.com.br",
              "http://localhost:8080"
            );
          }
        }
      },
      "/agendamento": {
        target: "https://agendamento.rjpasseios.com.br",
        changeOrigin: true,
        secure: true
      }
    }
  }
};
