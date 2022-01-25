FROM python:3.10

EXPOSE 5000
WORKDIR /backEnd

COPY backEnd/ /backEnd
RUN pip install -r requirements.txt

ENTRYPOINT ["python", "StartServer.py"]